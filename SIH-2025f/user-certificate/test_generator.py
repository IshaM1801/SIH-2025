# test_generator.py
from utils.certificate_generator import generate_certificate
import datetime

# Generate a sample certificate
path = generate_certificate(
    user_name="Indrajeet Singh",
    issue_title="Pothole",
    location="Vashi",
    resolution_date=datetime.date.today().strftime("%B %d, %Y")
)
