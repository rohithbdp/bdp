package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"strings"

	"github.com/rs/cors"
)

type ContactForm struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Message string `json:"message"`
}

func sendEmail(form ContactForm) error {
	// Email configuration
	from := os.Getenv("EMAIL_FROM")
	password := os.Getenv("EMAIL_PASSWORD")
	to := "bolamalarohith@gmail.com"
	
	// SMTP server configuration
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"
	
	// Message with proper headers
	subject := fmt.Sprintf("Portfolio Contact from %s", form.Name)
	body := fmt.Sprintf("Name: %s\nEmail: %s\n\nMessage:\n%s", form.Name, form.Email, form.Message)
	
	// Properly formatted email headers
	headers := make(map[string]string)
	headers["From"] = from
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/plain; charset=\"utf-8\""
	
	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + body
	
	// Authentication
	auth := smtp.PlainAuth("", from, password, smtpHost)
	
	// Send email
	log.Printf("Attempting to send email from %s to %s", from, to)
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, []byte(message))
	if err != nil {
		log.Printf("SMTP Error: %v", err)
		return err
	}
	log.Printf("Email sent successfully!")
	return nil
}

func contactHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	var form ContactForm
	err := json.NewDecoder(r.Body).Decode(&form)
	if err != nil {
		log.Printf("Failed to decode request: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	log.Printf("Received contact form: Name=%s, Email=%s", form.Name, form.Email)
	
	// Send email
	err = sendEmail(form)
	if err != nil {
		log.Printf("Failed to send email: %v", err)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status": "error",
			"message": "Failed to send message",
			"error": err.Error(),
		})
		return
	}
	
	log.Printf("Email sent successfully to %s", form.Email)
	
	// Send success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "success",
		"message": "Message sent successfully!",
	})
}

func main() {
	// Load environment variables from .env file if it exists
	if data, err := os.ReadFile(".env"); err == nil {
		lines := strings.Split(string(data), "\n")
		for _, line := range lines {
			if line != "" && !strings.HasPrefix(line, "#") {
				parts := strings.SplitN(line, "=", 2)
				if len(parts) == 2 {
					os.Setenv(strings.TrimSpace(parts[0]), strings.TrimSpace(parts[1]))
				}
			}
		}
	}
	
	// Log email configuration (without password)
	log.Printf("Email FROM: %s", os.Getenv("EMAIL_FROM"))
	log.Printf("Email configured: %v", os.Getenv("EMAIL_PASSWORD") != "")
	
	// Create a new CORS handler
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"}, // In production, replace with your domain
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type"},
	})
	
	// Create router
	mux := http.NewServeMux()
	mux.HandleFunc("/api/contact", contactHandler)
	mux.HandleFunc("/api/test", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status": "ok",
			"message": "Backend is running!",
		})
	})
	
	// Wrap the router with CORS middleware
	handler := c.Handler(mux)
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Printf("Server starting on port %s", port)
	log.Printf("Server is ready to handle requests")
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}