import HCaptcha from '@hcaptcha/react-hcaptcha';
import { showNotification } from '@mantine/notifications';

const Captcha = ({ show, onToken }) => {
    if (!show) {
        return null;
    }
 
    return (
        <>
            <HCaptcha
                sitekey={import.meta.env.MODE === 'development'
                    ? '10000000-ffff-ffff-ffff-000000000001'
                    : '798876a4-47b6-480a-b92c-45bedfc45272'}
                onVerify={onToken}
                onExpire={() => onToken('')}
                onError={(err) => {
                    onToken('');
                    showNotification({
                        title: 'Error',
                        message: 'Cannot verify captcha',
                    });
                    console.error(err);
                }}
            />
        </>
    );
};

export default Captcha;