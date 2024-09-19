# nettleship.net 

This repository contains the full stack codebase for the Nettleship.net website, including both the client and server components.

This project began in Python a while ago, just so I could play Uno with my friends in class on our laptops. Websites like this already existed, but we wanted our own version that was fully customizable. I managed to get the Python version to a playable state, though the code itself could’ve been better. 

I later decided to restart the project in JavaScript, and in doing so, I researched best practices for professional APIs and frontends. My aim is to learn as much about web development as possible. 

While rewriting it, I’ve also been taking notes so I can use this code for my A Level Computer Science coursework. 

## Project Structure

- `client/`: Contains the frontend code
- `server/`: Contains the backend code

## Getting Started

### Prerequisites

- Node.js v22.2.0
- npm
- MongoDB

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/OomsOoms/nettleship.net.git
    cd nettleship.net
    ```

2. Install dependencies for both client and server:

    ```sh
    cd client
    npm install
    cd ../server
    npm install
    ```

## Running the Application

### Client

1. Navigate to the client directory:

    ```sh
    cd client
    ```

2. Start the development server:

    ```sh
    npm run dev
    ```

3. The client will be running on http://localhost:3000.

### Server

Rrefer to the [server README](./server/README.md).

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](/LICENSE) file for details.
