FROM python:3.13

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

# RUN mkdir static
# RUN chmod 755 static

CMD ["sh", "-c", "\
    python manage.py makemigrations && \
    python manage.py migrate && \
    gunicorn --workers 3 --bind 0.0.0.0:8000 backend.wsgi:application \
"]