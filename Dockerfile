
FROM node:18


WORKDIR /app


COPY package*.json ./

RUN npm install

EXPOSE 3000

# Copy your application source code to the container
COPY . .

# Define environment variables for connecting to the PostgreSQL database
ENV POSTGRES_HOST=your-postgres-host
ENV POSTGRES_PORT=5432
ENV POSTGRES_DB=your-database
ENV POSTGRES_USER=your-user
ENV POSTGRES_PASSWORD=your-password

# Command to start your Node.js application
CMD ["npm", "run", "server"]
