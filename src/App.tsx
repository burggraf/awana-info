import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Redirect, Route, Switch } from 'react-router-dom'
import Menu from './components/Menu'

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'

/* Theme variables */
import './theme/variables.css'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import Group from './pages/Group'
import Groups from './pages/Groups'
import GroupTree from './pages/GroupTree'
import NotFound from './pages/NotFound'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Scan from './pages/Scan'
import Report from './pages/Report'
import People from './pages/People'
import Person from './pages/Person'
import SelectDefaultGroup from './pages/SelectDefaultGroup'

setupIonicReact({
	// rippleEffect: false,
	mode: 'ios',
  });
  
const App: React.FC = () => {
	const RequireLogin: any = ({ children }: { children: JSX.Element }) => {
		const auth = true;
		return (auth ? children : <Redirect to='/dashboard' />);
	  };
	return (
		<IonApp>
			<IonReactRouter>
				<IonSplitPane contentId='main'>
					<Menu />
					<IonRouterOutlet id='main'>
						<Switch>
							<Route path='/' exact={true}>
								<Redirect to='/dashboard' />
							</Route>
							<RequireLogin>
								<Route path='/profile' component={Profile} />
							</RequireLogin>						
							<Route path='/dashboard' exact={true} component={Dashboard} />
							<Route path='/groups' exact={true} component={Groups} />
							<Route path='/group' exact={true} component={Group} />
							<Route path='/grouptree/:id' exact={true} component={GroupTree} />
							<Route path='/group/:id' exact={true} component={Group} />
							<Route path='/privacy' exact={true} component={Privacy} />
							<Route path='/terms' exact={true} component={Terms} />
							<Route path='/scan' exact={true} component={Scan} />
							<Route path='/report' exact={true} component={Report} />
							<Route path='/people' exact={true} component={People} />
							<Route path='/person/:id' exact={true} component={Person} />
							<Route path='/selectdefaultgroup' exact={true} component={SelectDefaultGroup} />
							<Route component={NotFound} />
						</Switch>
					</IonRouterOutlet>
				</IonSplitPane>
			</IonReactRouter>
		</IonApp>
	)
}

export default App
