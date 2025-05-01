import useVerifyEmail from "../hooks/useVerifyEmail";
import MainLayout from '../../../components/layout/MainLayout';
import '../styles/Page.scss'

const VerifyEmailPage = () => {
    const { loading, error, success } = useVerifyEmail();

    return (
        <MainLayout>
            {loading && <p>Loading...</p>}
            {success && <p>Email verified successfully!</p>}
            {error && <p>{error}</p>}
            <a href="/login">Login</a>
        </MainLayout>
    );
};

export default VerifyEmailPage;
