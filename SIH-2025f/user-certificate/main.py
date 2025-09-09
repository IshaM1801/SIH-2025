# main.py

from utils.certificate_generator import generate_certificate
from utils.whatsapp_sender import send_whatsapp
import datetime
import urllib.parse

# FIX: Changed 'issue_description' to 'location' to match your generator script
def trigger_certificate_process(user_name, user_number, issue_title, location):
    print(f"Starting certificate process for {user_name}...")
    
    # 1. Generate the certificate and get its dynamic file path
    resolution_date = datetime.date.today().strftime("%B %d, %Y")
    certificate_path = generate_certificate(
        user_name=user_name,
        issue_title=issue_title,
        resolution_date=resolution_date,
        location=location  # FIX: Passing 'location' as expected
    )
    
    print(f"Certificate saved at: {certificate_path}")
    
    # Your correct ngrok URL
    ngrok_url = "https://f6073931aff7.ngrok-free.app"
    
    # This correctly parses the filename from the path
    filename = certificate_path.split('/')[-1]
    
    # This builds the final, properly formatted public URL
    public_url = f"{ngrok_url}/certificates/{urllib.parse.quote(filename)}"
    
    print(f"Constructed public URL: {public_url}")
    
    # 2. Send the certificate via WhatsApp
    message_sid = send_whatsapp(
        user_number=user_number,
        certificate_path=public_url
    )
    
    print(f"WhatsApp message sent successfully! SID: {message_sid}")


# --- Example Usage ---
if __name__ == "__main__":
    example_user_name = "Indrajeet Singh"
    example_user_number = "7021055989"  # Your phone number without +91
    example_issue_title = "Broken Streetlight"
    example_location = "Corner of MG Road, Mumbai" 
    
    try:
        trigger_certificate_process(
            example_user_name,
            example_user_number,
            example_issue_title,
            example_location
        )
    except Exception as e:
        print(f"❌ Error in certificate process: {e}")
        print("Please check your .env file and ensure Twilio credentials are correct.")