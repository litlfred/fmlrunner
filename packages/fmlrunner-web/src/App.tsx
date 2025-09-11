import React, { useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { FmlRunner } from 'fmlrunner';
import './App.css';

interface TabProps {
  id: string;
  label: string;
  active: boolean;
  onClick: (id: string) => void;
}

const Tab: React.FC<TabProps> = ({ id, label, active, onClick }) => (
  <button
    className={`tab ${active ? 'tab-active' : ''}`}
    onClick={() => onClick(id)}
  >
    {label}
  </button>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('playground');
  const [fmlContent, setFmlContent] = useState(`map "http://example.org/fml/example" = "ExampleMap"

uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as source
uses "http://hl7.org/fhir/StructureDefinition/Patient" alias PatientOut as target

group Patient(source src : Patient, target tgt : PatientOut) {
  src.name -> tgt.name;
  src.gender -> tgt.gender;
}`);
  const [inputData, setInputData] = useState(`{
  "resourceType": "Patient",
  "id": "example",
  "name": [
    {
      "family": "Smith",
      "given": ["John"]
    }
  ],
  "gender": "male"
}`);
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCompile = async () => {
    setIsLoading(true);
    try {
      const fmlRunner = new FmlRunner({ validateInputOutput: true });
      const result = fmlRunner.compileFml(fmlContent);
      
      if (result.success && result.structureMap) {
        setOutput(JSON.stringify(result.structureMap, null, 2));
      } else {
        setOutput(JSON.stringify({ 
          success: false, 
          errors: result.errors 
        }, null, 2));
      }
    } catch (error) {
      setOutput(JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = async () => {
    setIsLoading(true);
    try {
      const fmlRunner = new FmlRunner({ validateInputOutput: true });
      
      // First compile the FML
      const compilationResult = fmlRunner.compileFml(fmlContent);
      if (!compilationResult.success || !compilationResult.structureMap) {
        setOutput(JSON.stringify({ 
          success: false, 
          errors: ['Compilation failed: ' + (compilationResult.errors?.join(', ') || 'Unknown error')]
        }, null, 2));
        return;
      }

      // Register the StructureMap
      fmlRunner.registerStructureMap(compilationResult.structureMap);

      // Parse input data
      const inputContent = JSON.parse(inputData);

      // Execute transformation
      const result = await fmlRunner.executeStructureMapWithValidation(
        compilationResult.structureMap.url || compilationResult.structureMap.id || 'example',
        inputContent
      );

      setOutput(JSON.stringify(result, null, 2));
    } catch (error) {
      setOutput(JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'playground', label: 'FML Playground' },
    { id: 'api', label: 'API Documentation' },
    { id: 'examples', label: 'Examples' },
    { id: 'about', label: 'About' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'playground':
        return (
          <div className="playground">
            <div className="playground-header">
              <h2>FHIR Mapping Language Playground</h2>
              <p>
                Write FML content, test compilation, and execute transformations interactively.
                This playground uses the FML Runner library to provide real-time feedback.
              </p>
            </div>
            
            <div className="playground-content">
              <div className="input-section">
                <div className="input-group">
                  <label htmlFor="fml-content">FML Content:</label>
                  <textarea
                    id="fml-content"
                    value={fmlContent}
                    onChange={(e) => setFmlContent(e.target.value)}
                    placeholder="Enter your FML mapping content here..."
                    rows={12}
                  />
                </div>
                
                <div className="input-group">
                  <label htmlFor="input-data">Input Data (JSON):</label>
                  <textarea
                    id="input-data"
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    placeholder="Enter test input data as JSON..."
                    rows={8}
                  />
                </div>
                
                <div className="button-group">
                  <button 
                    onClick={handleCompile} 
                    disabled={isLoading}
                    className="btn btn-primary"
                  >
                    {isLoading ? 'Compiling...' : 'Compile FML'}
                  </button>
                  <button 
                    onClick={handleExecute} 
                    disabled={isLoading}
                    className="btn btn-secondary"
                  >
                    {isLoading ? 'Executing...' : 'Compile & Execute'}
                  </button>
                </div>
              </div>
              
              <div className="output-section">
                <label htmlFor="output">Output:</label>
                <textarea
                  id="output"
                  value={output}
                  readOnly
                  placeholder="Output will appear here..."
                  rows={20}
                />
              </div>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="api-docs">
            <h2>API Documentation</h2>
            <p>
              Interactive OpenAPI documentation for the FML Runner REST API.
              You can test endpoints directly from this interface.
            </p>
            <SwaggerUI 
              url="/openapi.yaml"
              tryItOutEnabled={true}
              requestInterceptor={(request) => {
                // Add base URL for API calls
                if (request.url.startsWith('/')) {
                  request.url = '/api' + request.url;
                }
                return request;
              }}
            />
          </div>
        );

      case 'examples':
        return (
          <div className="examples">
            <h2>FML Examples</h2>
            <div className="example-grid">
              <div className="example-card">
                <h3>Basic Patient Mapping</h3>
                <p>Simple mapping between Patient resources with name and gender transformation.</p>
                <button 
                  className="btn btn-outline"
                  onClick={() => setFmlContent(`map "http://example.org/fml/patient" = "PatientMap"

uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as source
uses "http://hl7.org/fhir/StructureDefinition/Patient" alias PatientOut as target

group Patient(source src : Patient, target tgt : PatientOut) {
  src.name -> tgt.name;
  src.gender -> tgt.gender;
  src.birthDate -> tgt.birthDate;
}`)}
                >
                  Load Example
                </button>
              </div>
              
              <div className="example-card">
                <h3>QuestionnaireResponse to Patient</h3>
                <p>Transform QuestionnaireResponse data into a Patient resource.</p>
                <button 
                  className="btn btn-outline"
                  onClick={() => setFmlContent(`map "http://example.org/fml/qr2patient" = "QRToPatient"

uses "http://hl7.org/fhir/StructureDefinition/QuestionnaireResponse" alias QR as source
uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as target

group QRToPatient(source src : QR, target tgt : Patient) {
  src.item as item where (linkId = 'name') -> tgt.name as name then {
    item.answer.valueString -> name.family;
  };
  
  src.item as item where (linkId = 'gender') -> tgt.gender = item.answer.valueString;
}`)}
                >
                  Load Example
                </button>
              </div>
              
              <div className="example-card">
                <h3>Conditional Mapping</h3>
                <p>Advanced mapping with conditional logic and value transformations.</p>
                <button 
                  className="btn btn-outline"
                  onClick={() => setFmlContent(`map "http://example.org/fml/conditional" = "ConditionalMap"

uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as source
uses "http://hl7.org/fhir/StructureDefinition/Patient" alias PatientOut as target

group Patient(source src : Patient, target tgt : PatientOut) {
  src.name -> tgt.name;
  src.gender where ($this = 'male') -> tgt.gender = 'M';
  src.gender where ($this = 'female') -> tgt.gender = 'F';
  src.active where ($this = true) -> tgt.active = true;
}`)}
                >
                  Load Example
                </button>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="about">
            <h2>About FML Runner</h2>
            <p>
              FML Runner is a comprehensive Node.js library and web interface for working with 
              FHIR Mapping Language (FML). It provides tools for compiling FML content into 
              StructureMaps and executing transformations on healthcare data.
            </p>
            
            <h3>Features</h3>
            <ul>
              <li>✅ Complete FML parser with proper tokenization and grammar handling</li>
              <li>✅ FHIR-compliant StructureMap compilation</li>
              <li>✅ Terminology-aware transformations with ConceptMaps</li>
              <li>✅ JSON schema validation for all input/output</li>
              <li>✅ REST API with OpenAPI documentation</li>
              <li>✅ Model Context Protocol (MCP) interface</li>
              <li>✅ Interactive web playground</li>
              <li>✅ Comprehensive logging and error handling</li>
            </ul>
            
            <h3>Packages</h3>
            <div className="package-grid">
              <div className="package-card">
                <h4>fmlrunner</h4>
                <p>Core library with compilation and execution capabilities</p>
              </div>
              <div className="package-card">
                <h4>fmlrunner-rest</h4>
                <p>REST API server with FHIR-compliant endpoints</p>
              </div>
              <div className="package-card">
                <h4>fmlrunner-mcp</h4>
                <p>Model Context Protocol interface for AI integration</p>
              </div>
              <div className="package-card">
                <h4>fmlrunner-web</h4>
                <p>Interactive React web interface (this application)</p>
              </div>
            </div>
            
            <h3>Links</h3>
            <ul>
              <li><a href="https://github.com/litlfred/fmlrunner" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
              <li><a href="https://build.fhir.org/mapping-language.html" target="_blank" rel="noopener noreferrer">FHIR Mapping Language Specification</a></li>
              <li><a href="https://hl7.org/fhir/structuremap.html" target="_blank" rel="noopener noreferrer">StructureMap Resource</a></li>
            </ul>
          </div>
        );

      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>FML Runner</h1>
          <p>FHIR Mapping Language Interface</p>
        </div>
      </header>
      
      <nav className="tab-nav">
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            id={tab.id}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={setActiveTab}
          />
        ))}
      </nav>
      
      <main className="app-main">
        {renderContent()}
      </main>
      
      <footer className="app-footer">
        <p>&copy; 2024 FML Runner. Licensed under MIT.</p>
      </footer>
    </div>
  );
};

export default App;