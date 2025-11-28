# ROI Vision: Investment Analysis Dashboard

This is a Next.js application built with Firebase Studio that provides a dashboard for visualizing and analyzing fictional Return on Investment (ROI) data for various city districts. It features an interactive map, detailed data sidebars, and an AI-powered report generation capability.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Data Backend**: Firestore
- **Mapping**: Google Maps Platform
- **UI**: ShadCN UI, Tailwind CSS
- **Generative AI**: Google AI (via Genkit)

## Getting Started

Follow these steps to set up and run the application on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or later)
- [npm](https://www.npmjs.com/) (or your preferred package manager like pnpm or yarn)
- A Firebase project with Firestore enabled.

### 1. Installation

First, clone the repository to your local machine:

```bash
git clone <your-repository-url>
cd <repository-name>
```

Next, install the dependencies from the project root directory:
```bash
npm install
```

### 2. Environment and Service Account Setup

This project requires API keys to connect to Google Maps, Google AI, and Firestore.

#### Step 2a: Create `.env.local` File
Create a `.env.local` file in the root of the project directory. You can copy the contents below to start.

```env
# .env.local

# --- Required for Frontend ---

# Your Google Maps API Key for the map component.
# Get one from the Google Cloud Console: https://console.cloud.google.com/google/maps-apis/
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"

# Your Google AI API Key for Genkit AI flows.
# Get one from Google AI Studio: https://aistudio.google.com/app/apikey
GOOGLE_API_KEY="YOUR_GOOGLE_AI_API_KEY"

# --- Required for Data Setup Script ---

# The Project ID of your Firebase project.
# Find this in your Firebase project settings.
PROJECT_ID="your-firebase-project-id"

# The Database ID of your Firestore instance (usually '(default)').
FIRESTORE_ID="(default)"

# Path to your Google Cloud service account key file (see step 2b).
# The setup script uses this to authenticate with Firestore without needing gcloud login.
GOOGLE_APPLICATION_CREDENTIALS="./your-service-account-key.json"
```

**Important:** Replace all placeholder values with your actual keys and project details.

#### Step 2b: Create a Service Account Key
To allow the setup script to write data to your Firestore database without needing to log in via `gcloud`, you need to create a service account key.

1.  **Navigate to IAM & Admin:** Go to the [Google Cloud Console](https://console.cloud.google.com/) -> **IAM & Admin** -> **Service Accounts**.
2.  **Select Project:** Make sure you have selected the correct Firebase project.
3.  **Create Service Account:**
    *   Click **+ CREATE SERVICE ACCOUNT**.
    *   Give it a name (e.g., `firebase-setup-script`).
    *   Click **CREATE AND CONTINUE**.
    *   Grant it the **Cloud Datastore User** role. This provides permissions to read and write to Firestore.
    *   Click **CONTINUE**, then **DONE**.
4.  **Generate Key:**
    *   Find the service account you just created in the list.
    *   Click the three-dot menu under "Actions" and select **Manage keys**.
    *   Click **ADD KEY** -> **Create new key**.
    *   Choose **JSON** as the key type and click **CREATE**. A JSON key file will be downloaded to your computer.
5.  **Use the Key:**
    *   Move the downloaded JSON file into the root directory of your project.
    *   Update the `GOOGLE_APPLICATION_CREDENTIALS` variable in your `.env.local` file to point to this filename (e.g., `./your-downloaded-key-file.json`).
    *   **Security Note:** Add the name of your key file to your `.gitignore` file to prevent it from being committed to source control.

### 3. Populate Firestore Data

Once your environment variables are set up, run the setup script to populate your Firestore database with the sample ROI data.

From the project root directory, run:
```bash
npm run setup-firestore
```
This script will read the data from the `/data` directory and upload it to the `geojson` and `report` collections in your Firestore database.

### 4. Running the Application

Start the Next.js development server:

```bash
npm run dev
```

This will start the development server, typically on port 9002.

### 5. Access the Application

Open your web browser and navigate to:

[http://localhost:9002](http://localhost:9002)

You should now see the ROI Vision dashboard running, fetching data from your Firestore database.
