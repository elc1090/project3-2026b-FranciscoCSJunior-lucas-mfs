import { ImgHTMLAttributes } from 'react';

// Ícone do SOSTENPYME (arquivo em public/icone_logo.png).
export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return <img src="/icone_logo.png" alt="" {...props} />;
}
