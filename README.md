# technical

This project retrieves customer detection data via REST API and saves it to CSV files. The main script to run is `cheq.js`.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.

### Installation

1. **Clone the repository:**

    ```sh
    git clone https://github.com/ThundroD/technical.git
    cd technical
    ```

2. **Install the required dependencies:**

    ```sh
    npm install
    ```

3. **Create a `.env` file in the root directory of the project:**

    ```sh
    touch .env
    ```

4. **Add the following environment variables to the `.env` file:**

    ```
    CLIENT_ID=your_client_id
    CLIENT_SECRET=your_client_secret
    ```

    Replace `your_client_id` and `your_client_secret` with your actual CHEQ API client ID and secret.

### Running the Code

To run the code, execute the following command in the terminal:

```sh
node cheq.js
