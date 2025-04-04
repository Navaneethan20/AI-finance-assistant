import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AIIntegration() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-12">
        <h1 className="text-4xl font-bold mb-8">AI Model Integration Guide</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Learn how to integrate AI models into your Finsave application for intelligent financial analysis.
        </p>

        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Integration Overview</CardTitle>
                <CardDescription>Understanding AI integration in Finsave</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">AI Capabilities in Finsave</h3>
                  <p>Finsave uses AI for several key features:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <strong>Transaction Categorization</strong> - Automatically categorize expenses and income
                    </li>
                    <li>
                      <strong>Statement Processing</strong> - Extract transactions from bank statements
                    </li>
                    <li>
                      <strong>Spending Insights</strong> - Generate personalized financial insights
                    </li>
                    <li>
                      <strong>Budget Recommendations</strong> - Suggest budget allocations based on spending patterns
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Architecture Overview</h3>
                  <p>The AI integration architecture consists of:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <strong>Client-side Models</strong> - Lightweight models for real-time categorization
                    </li>
                    <li>
                      <strong>Server-side Processing</strong> - Cloud Functions for complex analysis
                    </li>
                    <li>
                      <strong>Model Storage</strong> - TensorFlow.js models stored in Firebase Storage
                    </li>
                    <li>
                      <strong>Data Pipeline</strong> - Secure data flow between components
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Models</CardTitle>
                <CardDescription>AI models used in Finsave</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Transaction Categorization Model</h3>
                  <p>A neural network model that categorizes transactions based on description and amount:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <strong>Input</strong> - Transaction description and amount
                    </li>
                    <li>
                      <strong>Output</strong> - Category prediction (Food, Transportation, etc.)
                    </li>
                    <li>
                      <strong>Architecture</strong> - Text embedding + Dense layers
                    </li>
                    <li>
                      <strong>Format</strong> - TensorFlow.js model (model.json + weights.bin)
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Statement Processing Model</h3>
                  <p>A computer vision model that extracts data from bank statements:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <strong>Input</strong> - PDF or image of bank statement
                    </li>
                    <li>
                      <strong>Output</strong> - Structured transaction data
                    </li>
                    <li>
                      <strong>Architecture</strong> - OCR + NLP pipeline
                    </li>
                    <li>
                      <strong>Deployment</strong> - Server-side only (Cloud Function)
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Insights Generation Model</h3>
                  <p>A recommendation system that generates financial insights:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <strong>Input</strong> - User's transaction history
                    </li>
                    <li>
                      <strong>Output</strong> - Personalized financial insights
                    </li>
                    <li>
                      <strong>Architecture</strong> - Time series analysis + Rule-based system
                    </li>
                    <li>
                      <strong>Deployment</strong> - Server-side with cached results
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Process</CardTitle>
                <CardDescription>How to integrate AI models into Finsave</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Client-side Integration</h3>
                  <p>Integrate TensorFlow.js models for client-side inference:</p>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                    {`// Load the model
async function loadModel() {
  if (!window.categoryModel) {
    // Load from Firebase Storage or CDN
    window.categoryModel = await tf.loadLayersModel('/models/category-model/model.json');
  }
  return window.categoryModel;
}

// Use the model for prediction
async function predictCategory(description, amount) {
  const model = await loadModel();
  
  // Preprocess input
  const processedText = preprocessText(description);
  const features = extractFeatures(processedText, amount);
  
  // Make prediction
  const tensorInput = tf.tensor2d([features]);
  const prediction = model.predict(tensorInput);
  const categoryIndex = prediction.argMax(1).dataSync()[0];
  
  // Map index to category name
  const categories = [
    "Food & Dining", "Transportation", "Entertainment",
    "Housing", "Utilities", "Shopping", "Healthcare", "Education",
    "Travel", "Personal Care", "Gifts & Donations", "Other"
  ];
  
  return categories[categoryIndex];
}`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Server-side Integration</h3>
                  <p>Implement AI processing in Firebase Cloud Functions:</p>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                    {`const functions = require('firebase-functions');
const admin = require('firebase-admin');
const tf = require('@tensorflow/tfjs-node');
const vision = require('@google-cloud/vision');

admin.initializeApp();
const visionClient = new vision.ImageAnnotatorClient();

// Process statement with AI
exports.processStatement = functions.storage.object().onFinalize(async (object) => {
  // Get file from Storage
  const bucket = admin.storage().bucket(object.bucket);
  const file = bucket.file(object.name);
  
  // Extract text from PDF/image using Vision API
  const [result] = await visionClient.documentTextDetection(
    \`gs://\${object.bucket}/\${object.name}\`
  );
  const fullText = result.fullTextAnnotation.text;
  
  // Extract transactions using NLP
  const transactions = extractTransactionsFromText(fullText);
  
  // Categorize transactions using TensorFlow model
  const model = await tf.node.loadSavedModel('./models/categorizer');
  const categorizedTransactions = await categorizeTransactions(transactions, model);
  
  // Save to Firestore
  return saveTransactionsToFirestore(categorizedTransactions);
});`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Data Exchange</h3>
                  <p>Secure data flow between components:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <strong>Client to Server</strong> - HTTPS requests with Firebase Auth tokens
                    </li>
                    <li>
                      <strong>Server to Storage</strong> - Direct access via Firebase Admin SDK
                    </li>
                    <li>
                      <strong>Model to Database</strong> - Secure write operations with proper validation
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Deployment</CardTitle>
                <CardDescription>Deploying AI models for Finsave</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Client-side Model Deployment</h3>
                  <p>Deploy TensorFlow.js models for browser usage:</p>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Convert your trained model to TensorFlow.js format</li>
                    <li>Upload model files to Firebase Storage or CDN</li>
                    <li>Configure CORS for model access</li>
                    <li>Implement model loading and caching in the app</li>
                  </ol>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                    {`# Convert TensorFlow model to TensorFlow.js format
tensorflowjs_converter --input_format=keras \\
                      path/to/model.h5 \\
                      path/to/tfjs_model

# Upload to Firebase Storage
gsutil cp -r path/to/tfjs_model/* gs://your-bucket/models/category-model/`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Server-side Model Deployment</h3>
                  <p>Deploy models for server-side inference:</p>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Package your model with Cloud Functions</li>
                    <li>Configure memory and CPU requirements</li>
                    <li>Set up proper error handling and logging</li>
                    <li>Implement model versioning</li>
                  </ol>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                    {`// package.json for Cloud Functions
{
  "name": "finsave-ai-functions",
  "dependencies": {
    "firebase-admin": "^11.0.0",
    "firebase-functions": "^4.0.0",
    "@tensorflow/tfjs-node": "^4.0.0",
    "@google-cloud/vision": "^3.0.0"
  },
  "engines": {
    "node": "18"
  }
}`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Monitoring and Updating</h3>
                  <p>Monitor model performance and update as needed:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Track model accuracy and performance metrics</li>
                    <li>Collect user feedback for model improvements</li>
                    <li>Implement A/B testing for model updates</li>
                    <li>Set up automated retraining pipeline</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

