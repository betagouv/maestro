import { useSearchParams } from 'react-router-dom';

interface Props {}

export const LoginView: React.FC<Props> = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  searchParams.forEach((value, key) => console.log(key, value));

  return <div>Merci de patienter....</div>;
};

export default LoginView;
