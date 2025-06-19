import React, { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "../../layouts/Layout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import { verifyOTPAndResetPassword } from "../../services/userService";

function ResetPasswordSMS() {
    const router = useRouter();
    const query = router.query;
    const [inputs, setInputs] = useState({
        phone: '',
        tokenId: '',
        otp: '',
        newPassword: '',
        repeatPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.phone && query.tokenId) {
            setInputs(prev => ({
                ...prev,
                phone: query.phone,
                tokenId: query.tokenId
            }));
        }
    }, [query]);

    const handleChange = (e) => {
        var name = e.currentTarget.name;
        var value = e.currentTarget.value;
        setInputs(values => ({ ...values, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputs.otp || !inputs.newPassword || !inputs.repeatPassword) {
            toast.error('Please fill in all fields');
            return;
        }
        if (inputs.newPassword !== inputs.repeatPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (inputs.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            const response = await verifyOTPAndResetPassword({
                tokenId: inputs.tokenId,
                otp: inputs.otp,
                newPassword: inputs.newPassword
            });

            toast(response.data.appMessage);
            if (response.data.appStatus) {
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            toast.error('Error resetting password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!query.phone || !query.tokenId) {
        return (
            <Layout title='Invalid Reset Link'>
                <div className='container'>
                    <div className='row'>
                        <div className='col-12 col-md-12'>
                            <div className='sign-in-section'>
                                <div className='sign-up__card'>
                                    <div className='sign-up__card-body'>
                                        <div className='mt-2'>
                                            <p className='login-em'>Invalid Reset Link</p>
                                            <p className="alert alert-danger mt-3 mb-2 text-center">
                                                This password reset link is invalid or has expired.<br />
                                                Please contact support or request a new reset code.
                                            </p>
                                            <div className='text-center mt-4'>
                                                <Link href='/login' className='btn my-btn -red'>
                                                    Back to Login
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <>
            <ToastContainer />
            <Layout title='Reset Password'>
                <div className='container'>
                    <div className='row'>
                        <div className='col-12 col-md-12'>
                            <div className='sign-in-section'>
                                <div className='sign-up__card'>
                                    <div className='sign-up__card-body'>
                                        <div className='mt-2'>
                                            <p className='login-em'>Reset Password</p>
                                            <p className="alert alert-warning mt-3 mb-2 text-center">
                                                Password reset code has been sent to your phone number<br />
                                                <i><b>&quot;{query.phone}&quot;</b></i><br />
                                                Please check your messages and enter the code here.
                                            </p>
                                        </div>
                                        <form className='mt-4' onSubmit={handleSubmit}>
                                            <div className='myform-group'>
                                                <div className='col-12'>
                                                    <input 
                                                        className='form-control myform-control' 
                                                        type='text' 
                                                        name='otp' 
                                                        value={inputs.otp} 
                                                        onChange={handleChange} 
                                                        placeholder='Enter Code' 
                                                        maxLength="6"
                                                    />
                                                </div>
                                            </div>
                                            <div className='myform-group'>
                                                <div className='col-12 position-relative'>
                                                    <input 
                                                        className='form-control myform-control' 
                                                        style={{ paddingRight: '35px' }} 
                                                        type={showPassword ? 'text' : 'password'} 
                                                        name='newPassword' 
                                                        value={inputs.newPassword} 
                                                        onChange={handleChange} 
                                                        placeholder='Enter New Password' 
                                                    />
                                                    {showPassword ? 
                                                        <i className="fa fa-eye" style={{ position: 'absolute', top: '11px', right: '24px' }} onClick={() => setShowPassword(false)}></i> :
                                                        <i className="fa fa-eye-slash" style={{ position: 'absolute', top: '11px', right: '24px' }} onClick={() => setShowPassword(true)}></i>
                                                    }
                                                </div>
                                            </div>
                                            <div className='myform-group'>
                                                <div className='col-12 position-relative'>
                                                    <input 
                                                        className='form-control myform-control' 
                                                        style={{ paddingRight: '35px' }} 
                                                        type={showPassword ? 'text' : 'password'} 
                                                        name='repeatPassword' 
                                                        value={inputs.repeatPassword} 
                                                        onChange={handleChange} 
                                                        placeholder='Repeat New Password' 
                                                    />
                                                </div>
                                            </div>
                                            <div className='myform-group mt-4'>
                                                <div className='col-12'>
                                                    <button 
                                                        type="submit" 
                                                        className='btn my-btn -red' 
                                                        disabled={loading}
                                                    >
                                                        {loading ? 'Resetting...' : 'Reset Password'}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}

export default ResetPasswordSMS; 