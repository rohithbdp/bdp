package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"

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
	
	// Message
	subject := fmt.Sprintf("Portfolio Contact from %s", form.Name)
	body := fmt.Sprintf("Name: %s\nEmail: %s\n\nMessage:\n%s", form.Name, form.Email, form.Message)
	message := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", from, to, subject, body)
	
	// Authentication
	auth := smtp.PlainAuth("", from, password, smtpHost)
	
	// Send email
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, []byte(message))
	return err
}

func contactHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	var form ContactForm
	err := json.NewDecoder(r.Body).Decode(&form)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	// Send email
	err = sendEmail(form)
	if err != nil {
		log.Printf("Failed to send email: %v", err)
		http.Error(w, "Failed to send message", http.StatusInternalServerError)
		return
	}
	
	// Send success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "success",
		"message": "Message sent successfully!",
	})
}

func main() {
	// Create a new CORS handler
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"}, // In production, replace with your domain
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type"},
	})
	
	// Create router
	mux := http.NewServeMux()
	mux.HandleFunc("/api/contact", contactHandler)
	
	// Wrap the router with CORS middleware
	handler := c.Handler(mux)
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}