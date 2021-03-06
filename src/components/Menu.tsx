import {
	IonButton,
	IonContent,
	IonIcon,
	IonItem,
	IonLabel,
	IonList,
	IonListHeader,
	IonMenu,
	IonMenuToggle,
	IonNote,
} from '@ionic/react'
import { Login, ResetPassword, User, SupabaseAuthService } from 'ionic-react-supabase-login'
import { useEffect, useMemo, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import {
	barChartOutline,
	barChartSharp,
	newspaperOutline,
	newspaperSharp,
	peopleOutline,
	peopleSharp,
	scanOutline,
	scanSharp,
} from 'ionicons/icons'
import SupabaseDataService from '../services/supabase.data.service'

import info from '../../package.json'

import './Menu.css'
const supabaseDataService = SupabaseDataService.getInstance()

interface AppPage {
	url: string
	iosIcon: string
	mdIcon: string
	title: string
	showIf: boolean
}

let lastUserID: string | null = null

const Menu: React.FC = () => {
	const location = useLocation()
	const history = useHistory()
	const [user, setUser] = useState<User | null>(null)
	const [profile, setProfile] = useState<any>(null)
	const [invites, setInvites] = useState<any[]>([])
	const [currentGroup, setCurrentGroup] = useState<any>(null)

	const pages = useMemo(
		() => [
			{
				title: 'Dashboard',
				url: '/dashboard',
				iosIcon: barChartOutline,
				mdIcon: barChartSharp,
				showIf: true,
			},
			{
				title: 'Groups',
				url: '/groups',
				iosIcon: peopleOutline,
				mdIcon: peopleSharp,
				showIf: (user !== null && currentGroup !== null) ,
			},
			{
				title: 'People',
				url: '/people',
				iosIcon: peopleOutline,
				mdIcon: peopleSharp,
				showIf: (user !== null && currentGroup !== null) ,
			},
			{
				title: 'Report',
				url: '/report',
				iosIcon: newspaperOutline,
				mdIcon: newspaperSharp,
				showIf: (user !== null && currentGroup !== null) ,
			},
			{
				title: 'Scan',
				url: '/scan',
				iosIcon: scanOutline,
				mdIcon: scanSharp,
				showIf: (user !== null && currentGroup !== null) ,
			},
		],
		[user, currentGroup]
	)

	const [appPages, setAppPages] = useState<AppPage[]>(pages)
	const goToProfile = async () => {
		history.replace('/profile')
	}
	const goToDashboard = async () => {
		history.replace('/dashboard')
	}
	const onSignIn = (user: any, session: any) => {
		window.location.reload()
	}
	const onSignOut = () => {
		window.location.reload()
	}
	useEffect(() => {
		const userSubscription = SupabaseAuthService.user.subscribe(setUser)
		const profileSubscription = SupabaseAuthService.profile.subscribe(setProfile)

		return () => {
			userSubscription.unsubscribe()
			profileSubscription.unsubscribe()
		}
	}, [])
	useEffect(() => {
		if (lastUserID === user?.id || (lastUserID === null && user === null)) {
			return // prevent looping, but looping will occur until setAppPages is finished
		}
		console.log('lastUserID', lastUserID)
		if (user && profile) {
		}
		lastUserID = user?.id || null
		if (user?.email) {
			getMyInvitations(user?.email)
		} else {
			setInvites([])
		}
		const currentGroup = localStorage.getItem('currentGroup');
		setCurrentGroup(currentGroup ? JSON.parse(currentGroup) : null)
	}, [user, profile, pages])

	useEffect(()=> {
		console.log('*** setAppPages', pages);
		setAppPages(pages)
	},[currentGroup, pages])

	const getMyInvitations = async (user_id: string) => {
		if (!supabaseDataService.isConnected()) {
			await supabaseDataService.connect() // wait for db connection
		}
		const { data, error } = await supabaseDataService.getMyInvitations(user_id)
		if (error) {
			console.error('error getting my invitations', error)
		} else {
			console.log('getMyInvitations', data)
			setInvites(data)
		}
	}

	return (
		<IonMenu contentId='main' type='overlay'>
			<IonContent>
				<IonList id='inbox-list'>
					<IonListHeader>Awana Info</IonListHeader>
					<IonNote>
						tag line here
						<br />v{info?.version}
					</IonNote>
					<IonMenuToggle>
						<Login
							SUPABASE_URL={process.env.REACT_APP_SUPABASE_URL || ''}
							SUPABASE_KEY={process.env.REACT_APP_SUPABASE_KEY || ''}
							providers={['facebook', 'google']}
							// providers={['google', 'facebook', 'twitter', 'linkedin']}
							backdropDismiss={false}
							profileFunction={goToProfile}
							onSignIn={onSignIn}
							onSignOut={onSignOut}
							profileTable={'profile'}
							profileKey={'id'}
							setUser={setUser}
						/>
					</IonMenuToggle>
					<ResetPassword
						SUPABASE_URL={process.env.REACT_APP_SUPABASE_URL || ''}
						SUPABASE_KEY={process.env.REACT_APP_SUPABASE_KEY || ''}
					/>

					{invites.length > 0 && (
						<div className='ion-padding'>
							<IonMenuToggle key={'pendingInvites'} autoHide={false}>
								<IonButton onClick={goToDashboard} size='small' expand='block' color='danger'>
									See Pending Invites
								</IonButton>
							</IonMenuToggle>
						</div>
					)}
					{appPages.map((appPage, index) => {
						if (appPage.showIf) {
							return (
								<IonMenuToggle key={index} autoHide={false}>
									<IonItem
										className={location.pathname === appPage.url ? 'selected' : ''}
										routerLink={appPage.url}
										routerDirection='none'
										lines='none'
										detail={false}>
										<IonIcon slot='start' ios={appPage.iosIcon} md={appPage.mdIcon} />
										<IonLabel>{appPage.title}</IonLabel>
									</IonItem>
								</IonMenuToggle>
							)
						} else {
							return null
						}
					})}
				</IonList>
				<div className='ion-padding'>
					group: {currentGroup?.name || 'No Group'}
				</div>
				{/* <pre>
            { JSON.stringify(invites, null, 2) }
          </pre> */}
			</IonContent>
		</IonMenu>
	)
}

export default Menu
