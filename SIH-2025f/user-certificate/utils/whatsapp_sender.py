# # utils/whatsapp_sender.py
# import os
# from twilio.rest import Client
# from twilio.base.exceptions import TwilioException
# from dotenv import load_dotenv

# load_dotenv() # Load the .env file

# def send_whatsapp(user_number, certificate_path):
#     try:
#         # Get Twilio credentials from environment variables
#         account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
#         auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
#         whatsapp_number = os.environ.get('TWILIO_WHATSAPP_NUMBER')
        
#         # Validate credentials
#         if not account_sid or not auth_token:
#             raise ValueError("Twilio credentials not found. Please check your .env file.")
        
#         if account_sid == 'your_twilio_account_sid_here' or auth_token == 'your_twilio_auth_token_here':
#             raise ValueError("Please update your .env file with actual Twilio credentials.")
        
#         # Initialize Twilio client
#         client = Client(account_sid, auth_token)
        
#         # Format phone number to ensure it starts with +
#         if not user_number.startswith('+'):
#             user_number = '+' + user_number
        
#         # Create WhatsApp message
#         message = client.messages.create(
#             from_=f'whatsapp:{whatsapp_number}',
#             to=f'whatsapp:{user_number}',
#             body='🎉 Your reported issue has been resolved! Please find your certificate attached. Thank you for helping improve our community!',
#             media_url=[certificate_path] 
#         )
        
#         print(f"WhatsApp message sent successfully to {user_number}")
#         print(f"Message SID: {message.sid}")
#         return message.sid
        
#     except TwilioException as e:
#         print(f"Twilio Error: {e}")
#         raise e
#     except Exception as e:
#         print(f"Error sending WhatsApp message: {e}")
#         raise e