import React, { useState } from 'react';
import { X, Check, Sparkles, Crown, Zap, Star, Shield, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RAZORPAY_KEY_ID } from '../../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Pricing plans with discounts
const PLANS = [
    {
        id: 'monthly',
        name: 'Pro Monthly',
        price: 500,
        originalPrice: 999,
        period: 'month',
        discount: '50% OFF',
        features: [
            'Unlimited profile analyses',
            'Unlimited resume exports',
            'AI-powered suggestions',
            'Priority support',
            'All premium templates'
        ],
        popular: false
    },
    {
        id: 'yearly',
        name: 'Pro Yearly',
        price: 5500,
        originalPrice: 11988,
        period: 'year',
        discount: '54% OFF',
        monthlyEquivalent: 458,
        features: [
            'Everything in Monthly',
            'Save ₹6,488/year',
            'Early access to features',
            'Custom branding',
            'API access'
        ],
        popular: true
    },
    {
        id: 'lifetime',
        name: 'Lifetime Access',
        price: 15000,
        originalPrice: 29999,
        period: 'once',
        discount: '50% OFF',
        features: [
            'Pay once, use forever',
            'All future updates',
            'VIP support',
            'White-label option',
            'Priority feature requests'
        ],
        popular: false,
        badge: 'BEST VALUE'
    }
];

export default function PaywallModal({ isOpen, onClose, type = 'analysis' }) {
    const { user, updateSubscription } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState('yearly');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handlePayment = async (plan) => {
        setIsProcessing(true);

        try {
            // Razorpay Standard Checkout integration
            // Following: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/

            const options = {
                key: RAZORPAY_KEY_ID, // Test Key ID from dashboard
                amount: plan.price * 100, // Amount in paise (smallest currency unit)
                currency: 'INR',
                name: 'LinkedIn Optimizer',
                description: `${plan.name} Subscription`,
                image: 'https://cdn-icons-png.flaticon.com/512/174/174857.png', // LinkedIn icon

                // Handler function for successful payment
                handler: async function (response) {
                    console.log('Payment successful:', response);

                    // Store payment details in Firestore
                    try {
                        const paymentRef = doc(db, 'payments', response.razorpay_payment_id);
                        await setDoc(paymentRef, {
                            userId: user?.uid,
                            userEmail: user?.email,
                            amount: plan.price,
                            plan: plan.id,
                            planName: plan.name,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id || null,
                            razorpaySignature: response.razorpay_signature || null,
                            status: 'success',
                            createdAt: serverTimestamp()
                        });
                    } catch (err) {
                        console.error('Error storing payment:', err);
                    }

                    // Calculate subscription end date
                    let endDate = null;
                    if (plan.id === 'monthly') {
                        endDate = new Date();
                        endDate.setMonth(endDate.getMonth() + 1);
                    } else if (plan.id === 'yearly') {
                        endDate = new Date();
                        endDate.setFullYear(endDate.getFullYear() + 1);
                    }
                    // Lifetime has no end date (null)

                    // Update subscription in database
                    await updateSubscription(
                        plan.id === 'lifetime' ? 'lifetime' : `pro_${plan.id}`,
                        endDate
                    );

                    onClose();
                    alert('🎉 Payment successful! Enjoy unlimited access to LinkedIn Optimizer Pro.');
                },

                // Prefill customer details
                prefill: {
                    name: user?.displayName || '',
                    email: user?.email || '',
                    contact: '' // Optional phone number
                },

                // Additional notes for reference
                notes: {
                    plan: plan.id,
                    userId: user?.uid || 'anonymous'
                },

                // Theme customization
                theme: {
                    color: '#0a66c2' // LinkedIn blue
                },

                // Modal options
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                        console.log('Payment modal closed');
                    },
                    confirm_close: true,
                    escape: true
                },

                // Retry options
                retry: {
                    enabled: true,
                    max_count: 3
                }
            };

            // Check if Razorpay is loaded
            if (window.Razorpay) {
                const rzp = new window.Razorpay(options);

                // Handle payment failure
                rzp.on('payment.failed', function (response) {
                    console.error('Payment failed:', response.error);
                    alert(`Payment failed: ${response.error.description}`);
                    setIsProcessing(false);
                });

                rzp.open();
            } else {
                alert('Payment gateway not loaded. Please refresh the page and try again.');
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment initialization failed. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-5xl bg-[#0f1115] rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-b from-yellow-500/10 to-transparent blur-3xl pointer-events-none" />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10 text-gray-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    {/* Left Side: Value Prop */}
                    <div className="lg:col-span-5 p-8 lg:p-12 bg-gradient-to-br from-gray-900 to-black border-r border-white/5 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-xs font-bold tracking-wider mb-8">
                                <Crown className="w-3 h-3" />
                                PREMIUM ACCESS
                            </div>

                            <h2 className="text-4xl font-bold mb-6 text-white leading-tight">
                                Unlock Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                                    Career Potential
                                </span>
                            </h2>

                            <div className="space-y-6 mb-12">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0 border border-yellow-500/20">
                                        <Zap className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white mb-1">Unlimited AI Analysis</h3>
                                        <p className="text-sm text-gray-400">Get instant feedback on every profile update without limits.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                                        <Star className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white mb-1">Top 1% Ranking</h3>
                                        <p className="text-sm text-gray-400">Advanced strategies to outrank competitors in recruiter searches.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                                        <Lock className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white mb-1">Unlock All Features</h3>
                                        <p className="text-sm text-gray-400">Access resume export, deep analysis, and premium templates.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs text-white">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm">
                                    <div className="text-white font-semibold">Join 10,000+ Pros</div>
                                    <div className="text-gray-500 text-xs">Getting hired at top tech companies</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Pricing */}
                    <div className="lg:col-span-7 p-8 lg:p-12 bg-[#0f1115]">
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-bold text-white mb-2">Choose Your Plan</h3>
                            <p className="text-gray-400 text-sm">Cancel anytime. No hidden fees.</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            {PLANS.map((plan) => (
                                <div
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan.id)}
                                    className={`relative p-4 rounded-xl cursor-pointer transition-all border ${selectedPlan === plan.id
                                        ? 'border-yellow-500/50 bg-yellow-500/5'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 right-4 px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded-full uppercase tracking-wider">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === plan.id
                                                    ? 'border-yellow-500 bg-yellow-500'
                                                    : 'border-gray-600'
                                                }`}>
                                                {selectedPlan === plan.id && <Check className="w-3 h-3 text-black" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white">{plan.name}</span>
                                                    {plan.discount && (
                                                        <span className="text-xs text-green-400 font-medium bg-green-400/10 px-1.5 py-0.5 rounded">
                                                            {plan.discount}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-400">
                                                    {plan.id === 'yearly' ? 'Billed annually' : plan.id === 'monthly' ? 'Billed monthly' : 'One-time payment'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-white">₹{plan.price.toLocaleString()}</div>
                                            <div className="text-xs text-gray-500 line-through">₹{plan.originalPrice.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePayment(PLANS.find(p => p.id === selectedPlan))}
                            disabled={isProcessing}
                            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-bold text-black text-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5 fill-black" />
                                    Get Instant Access
                                </>
                            )}
                        </button>

                        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Secure SSL
                            </div>
                            <div className="w-1 h-1 rounded-full bg-gray-700" />
                            <div>30-Day Money Back Guarantee</div>
                        </div>

                        {/* Test mode notice */}
                        <div className="mt-4 text-center">
                            <p className="text-xs text-yellow-500/70">
                                🧪 Test Mode: Use card 4111 1111 1111 1111
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
