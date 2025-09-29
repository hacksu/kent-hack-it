FROM kalilinux/kali-rolling

# Update and install necessary packages
RUN apt-get update && apt-get install -y \
    apache2 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create web directory
RUN mkdir -p /var/www/html

# Copy the .txt files from local folder
COPY *.txt /var/www/html/

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html
RUN chmod 644 /var/www/html/*.txt

# Expose port 80
EXPOSE 80

# Start Apache service
CMD ["apache2ctl", "-D", "FOREGROUND"]
