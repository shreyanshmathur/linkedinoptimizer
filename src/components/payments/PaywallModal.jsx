import React, { useState } from 'react';
import { X, Check, Sparkles, Crown, Zap, Star, Shield } from 'lucide-react';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl bg-gray-900 rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="relative px-8 pt-8 pb-6 text-center bg-gradient-to-b from-linkedin-600/20 to-transparent">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-full text-yellow-400 text-sm font-semibold mb-4">
                        <Crown className="w-4 h-4" />
                        UPGRADE TO PRO
                    </div>
                    <h2 className="text-3xl font-bold mb-2">
                        {type === 'analysis'
                            ? "You've used all 3 free analyses"
                            : "You've used all 3 free exports"
                        }
                    </h2>
                    <p className="text-gray-400">
                        Unlock unlimited access to supercharge your LinkedIn profile
                    </p>
                </div>

                {/* Plans */}
                <div className="px-8 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PLANS.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`relative p-6 rounded-2xl cursor-pointer transition-all ${selectedPlan === plan.id
                                        ? 'border-2 border-linkedin-500 bg-linkedin-500/10'
                                        : 'border border-white/10 bg-white/5 hover:border-white/30'
                                    } ${plan.popular ? 'ring-2 ring-yellow-500/50' : ''}`}
                            >
                                {/* Popular badge */}
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-black">
                                        MOST POPULAR
                                    </div>
                                )}

                                {/* Best value badge */}
                                {plan.badge && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-xs font-bold text-black">
                                        {plan.badge}
                                    </div>
                                )}

                                {/* Discount badge */}
                                <div className="inline-block px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded mb-3">
                                    {plan.discount}
                                </div>

                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>

                                {/* Price */}
                                <div className="mb-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold">₹{plan.price.toLocaleString()}</span>
                                        <span className="text-gray-500">/{plan.period}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 line-through">
                                        ₹{plan.originalPrice.toLocaleString()}
                                    </div>
                                    {plan.monthlyEquivalent && (
                                        <div className="text-sm text-green-400">
                                            Just ₹{plan.monthlyEquivalent}/month
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-2 mb-6">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Select indicator */}
                                {selectedPlan === plan.id && (
                                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-linkedin-500 flex items-center justify-center">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={() => handlePayment(PLANS.find(p => p.id === selectedPlan))}
                        disabled={isProcessing}
                        className="w-full mt-6 py-4 bg-gradient-to-r from-linkedin-500 to-linkedin-400 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Zap className="w-5 h-5" />
                                Upgrade Now - ₹{PLANS.find(p => p.id === selectedPlan)?.price.toLocaleString()}
                            </>
                        )}
                    </button>

                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-6 mt-6 text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            <span>4.9/5 Rating</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            <span>7-Day Refund</span>
                        </div>
                    </div>

                    {/* Test mode notice */}
                    <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                        <p className="text-sm text-yellow-400">
                            🧪 <strong>Test Mode:</strong> Use card 4111 1111 1111 1111 with any future expiry date
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
