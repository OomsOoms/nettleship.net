process.env.PORT = '4000'; // Set the port for testing
process.env.DOMAIN = 'http://localhost:4000'; // Set the domain for testing
process.env.NODE_ENV = 'test'; // Ensure NODE_ENV is set to test, jest already does this but just to be sure
process.env.ADMIN_PASSWORD = 'admin'; // Set the admin password for testing