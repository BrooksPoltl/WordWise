from setuptools import setup, find_packages

setup(
    name="wordwise-backend",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "fastapi==0.104.1",
        "uvicorn==0.24.0",
        "firebase-admin==6.2.0",
        "python-dotenv==1.0.0",
        "pydantic==2.4.2",
        "python-multipart==0.0.6",
    ],
) 