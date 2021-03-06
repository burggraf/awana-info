import {
	IonAvatar,
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonIcon,
	IonInput,
	IonItem,
	IonLabel,
	IonList,
	IonMenuButton,
	IonPage,
	IonTextarea,
	IonTitle,
	IonToolbar,
} from '@ionic/react'
import './Profile.css'
import SupabaseDataService from '../services/supabase.data.service'
import { SupabaseAuthService } from 'ionic-react-supabase-login'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { checkmarkOutline, personOutline, personSharp } from 'ionicons/icons'
const supabaseDataService = SupabaseDataService.getInstance()

const Profile: React.FC = () => {
	const [user, setUser] = useState<User | null>(null)
	const [profile, setProfile] = useState<any>(null)
	// const [avatar, getAvatar] = useState<string | null>(null)
	useEffect(() => {
		const userSubscription = SupabaseAuthService.user.subscribe(setUser)
		const profileSubscription = SupabaseAuthService.profile.subscribe(setProfile)

		return () => {
			userSubscription.unsubscribe()
			profileSubscription.unsubscribe()
		}
	}, [])

	useEffect(() => {
		if (user && profile) {
			// do nothing
		}
	}, [user, profile])

	// const { name } = useParams<{ name: string; }>();
	const save = async () => {
		await supabaseDataService.saveProfile(profile)
	}

	const findAvatar = (user: User | null, profile: any | null) => {
		let picture = ''
		if (profile && profile.avatar) {
			picture = profile.avatar
		} else {
			user?.identities?.map((identity) => {
				if (identity.identity_data?.picture) {
					picture = identity.identity_data.picture
				}
				return null
			})
		}

		return (
			<IonAvatar>
				{picture ? (
					<img src={picture} alt="avatar" />
				) : (
					<IonIcon size='large' ios={personOutline} md={personSharp}></IonIcon>
				)}
			</IonAvatar>
		)
	}

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonMenuButton />
					</IonButtons>
					<IonTitle>My Profile</IonTitle>
					<IonButtons slot='end'>
						<IonButton color='primary' onClick={save}>
							<IonIcon size='large' icon={checkmarkOutline}></IonIcon>
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>

			<IonContent className='ion-padding'>
				{/* <pre>{JSON.stringify(profile, null, 2)}</pre> */}
				<IonList>
					<IonItem lines='none' detail={false}>
						{findAvatar(user, profile)}
						<IonLabel className='ion-text-center ion-text-wrap'>
							<strong>{user?.email || 'no user'}</strong>
						</IonLabel>
					</IonItem>
					<IonItem lines='none'>
						<IonLabel slot='start' class='itemLabel'>
							First Name
						</IonLabel>
						<IonInput
							type='text'
							placeholder={'First Name'}
							onIonChange={(e: any) => setProfile({ ...profile, firstname: e.detail.value! })}
							value={profile?.firstname!}
							class='inputBox'></IonInput>
					</IonItem>
					<IonItem lines='none'>
						<IonLabel slot='start' class='itemLabel'>
							Last Name
						</IonLabel>
						<IonInput
							type='text'
							placeholder={'Last Name'}
							onIonChange={(e: any) => setProfile({ ...profile, lastname: e.detail.value! })}
							value={profile?.lastname!}
							class='inputBox'></IonInput>
					</IonItem>
					<IonItem lines='none'>
						<IonLabel slot='start' class='itemLabel'>
							Email
						</IonLabel>
						<IonInput
							type='text'
							disabled={true}
							placeholder={'Email'}
							value={profile?.email!}
							class='inputBox'></IonInput>
					</IonItem>
					<IonItem lines='none'>
						<IonLabel slot='start' class='itemLabel'>
							Phone
						</IonLabel>
						<IonInput
							type='number'
							placeholder={'Phone'}
							onIonChange={(e: any) => setProfile({ ...profile, phone: e.detail.value! })}
							value={profile?.phone!}
							class='inputBox'></IonInput>
					</IonItem>
					<IonItem lines='none'>
						<IonLabel slot='start' class='itemLabel'>
							Address
						</IonLabel>
						<IonInput
							type='text'
							placeholder={'Address'}
							onIonChange={(e: any) => setProfile({ ...profile, address: e.detail.value! })}
							value={profile?.address!}
							class='inputBox'></IonInput>
					</IonItem>
					<IonItem lines='none'>
						<IonLabel slot='start' class='itemLabel'>
							City
						</IonLabel>
						<IonInput
							type='text'
							placeholder={'City'}
							onIonChange={(e: any) => setProfile({ ...profile, city: e.detail.value! })}
							value={profile?.city!}
							class='inputBox'></IonInput>
					</IonItem>
					<IonItem lines='none'>
						<IonLabel slot='start' class='itemLabel'>
							State
						</IonLabel>
						<IonInput
							type='text'
							placeholder={'State'}
							onIonChange={(e: any) => setProfile({ ...profile, state: e.detail.value! })}
							value={profile?.state!}
							class='inputBox'></IonInput>
					</IonItem>
					<IonItem lines='none'>
						<IonLabel slot='start' class='itemLabel'>
							Zip
						</IonLabel>
						<IonInput
							type='text'
							placeholder={'Postal Code'}
							onIonChange={(e: any) => setProfile({ ...profile, postal_code: e.detail.value! })}
							value={profile?.postal_code!}
							class='inputBox'></IonInput>
					</IonItem>
					<IonItem lines='none'>
						<IonLabel slot='start' class='itemLabel'>
							About me...
						</IonLabel>
						<IonTextarea
							rows={3}
							autoGrow={true}
							placeholder={'What would you like to tell us about yourself?'}
							onIonChange={(e: any) => setProfile({ ...profile, bio: e.detail.value! })}
							value={profile?.bio!}
							class='inputBox'></IonTextarea>
					</IonItem>
				</IonList>
			</IonContent>
		</IonPage>
	)
}

export default Profile
