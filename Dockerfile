FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p static media

RUN python manage.py collectstatic --noinput --clear  

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]