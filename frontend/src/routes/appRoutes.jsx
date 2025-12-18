import Home from '../pages/Home.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import Orientation from '../pages/Orientation.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'

export const appRoutes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/sign-in',
    element: <LoginPage />,
  },
  {
    path: '/sign-up',
    element: <RegisterPage />,
  },
  {
    path: '/orientation',
    element: <Orientation />,
  },
]
