# ==============================================================================
# DOCKERFILE - THERAHULPATIL PORTFOLIO
# Lightweight, high-performance Nginx Alpine Container
# ==============================================================================

FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy portfolio static website files
COPY . /usr/share/nginx/html/

# Expose HTTP port
EXPOSE 80

# Health check to ensure website is responsive
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
