import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StepIndicator: React.FC<{ step: number; currentStep: number; title: string; }> = ({ step, currentStep, title }) => (
    <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            {currentStep > step ? <i data-lucide="check" className="w-5 h-5"></i> : step}
        </div>
        <span className={`ml-3 font-medium ${currentStep >= step ? 'text-blue-600' : 'text-gray-500'}`}>{title}</span>
    </div>
);

const LandlordRegistrationPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: '',
        idNumber: '',
    });
    const [files, setFiles] = useState({
        idDoc: null as File | null,
        proofOfAddress: null as File | null,
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFiles({ ...files, [e.target.name]: e.target.files[0] });
        }
    };
    
    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        // TODO: Implement API call to register landlord
        console.log({ formData, files });
        alert('Registration Submitted! (dev placeholder)');
        navigate('/dashboard'); // Redirect to dashboard on success
    };

    const renderStepContent = () => {
        switch(step) {
            case 1: // Account
                return (
                    <>
                        <h3 className="text-xl font-semibold mb-4 text-gray-700">Step 1: Account Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-1" htmlFor="email">Email Address</label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1" htmlFor="password">Password</label>
                                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                             <div>
                                <label className="block text-gray-700 font-medium mb-1" htmlFor="confirmPassword">Confirm Password</label>
                                <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                        </div>
                    </>
                );
            case 2: // Profile
                return (
                    <>
                        <h3 className="text-xl font-semibold mb-4 text-gray-700">Step 2: Personal Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-1" htmlFor="fullName">Full Name</label>
                                <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1" htmlFor="phone">Phone Number</label>
                                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                        </div>
                    </>
                );
            case 3: // Verification
                return (
                     <>
                        <h3 className="text-xl font-semibold mb-4 text-gray-700">Step 3: Verification</h3>
                        <p className="text-sm text-gray-600 mb-4">To ensure the safety of our community, we require verification documents.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-1" htmlFor="idNumber">ID / Passport Number</label>
                                <input type="text" id="idNumber" name="idNumber" value={formData.idNumber} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Upload ID/Passport Copy</label>
                                <input type="file" name="idDoc" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                {files.idDoc && <span className="text-xs text-gray-600 mt-1 block">Selected: {files.idDoc.name}</span>}
                            </div>
                             <div>
                                <label className="block text-gray-700 font-medium mb-1">Upload Proof of Address</label>
                                <input type="file" name="proofOfAddress" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                {files.proofOfAddress && <span className="text-xs text-gray-600 mt-1 block">Selected: {files.proofOfAddress.name}</span>}
                            </div>
                        </div>
                    </>
                );
            default: return null;
        }
    }

    return (
        <div className="bg-slate-50 py-12">
            <div className="container mx-auto max-w-2xl">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Become a Landlord</h2>
                    <p className="text-center text-gray-600 mb-8">Join KasiStays and start earning from your property.</p>

                    <div className="flex justify-between items-center mb-8 p-4 bg-gray-100 rounded-lg">
                       <StepIndicator step={1} currentStep={step} title="Account" />
                       <div className="flex-grow h-0.5 bg-gray-300 mx-4"></div>
                       <StepIndicator step={2} currentStep={step} title="Profile" />
                       <div className="flex-grow h-0.5 bg-gray-300 mx-4"></div>
                       <StepIndicator step={3} currentStep={step} title="Verification" />
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
                        
                        <div className="min-h-[250px]">
                          {renderStepContent()}
                        </div>

                        <div className="flex justify-between items-center mt-8">
                            {step > 1 ? (
                                <button type="button" onClick={prevStep} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
                                    Back
                                </button>
                            ) : <div></div>}
                            
                            {step < 3 ? (
                                <button type="button" onClick={nextStep} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                                    Next Step
                                </button>
                            ) : (
                                <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors">
                                    Complete Registration
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LandlordRegistrationPage;