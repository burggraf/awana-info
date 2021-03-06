import {
	IonBackButton,
	IonButton,
	IonButtons,
	IonCol,
	IonContent,
	IonFooter,
	IonGrid,
	IonHeader,
	IonIcon,
	IonInput,
	IonItem,
	IonItemDivider,
	IonLabel,
	IonList,
	IonPage,
	IonRow,
	IonSelect,
	IonSelectOption,
	IonTextarea,
	IonTitle,
	IonToolbar,
	useIonAlert,
	useIonToast,
} from '@ionic/react'
import { SupabaseAuthService } from 'ionic-react-supabase-login'
import { checkmarkOutline } from 'ionicons/icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useHistory, useParams } from 'react-router'

import { Grid } from 'gridjs-react'
// import { RowSelection } from "gridjs/plugins/selection";
// import "gridjs/dist/theme/mermaid.css";
import '../theme/mermaid.css'

import SupabaseDataService from '../services/supabase.data.service'
import UtilityFunctionsService from '../services/utility.functions.service'
import GridService from '../services/grid.service'

import './Group.css'

const supabaseDataService = SupabaseDataService.getInstance()
const utilityFunctionsService = UtilityFunctionsService.getInstance()
const gridService = GridService.getInstance()

const Group: React.FC = () => {
	const history = useHistory()
	const membersGrid: any = useRef(null)
	const [presentAlert] = useIonAlert()
	const [user, setUser] = useState<any>(null)
	const [group, setGroup] = useState<any>(null)
	const [inviteUsers, setInviteUsers] = useState<string>('')
	const [invites, setInvites] = useState<any[]>([])
	const [inviteAccess, setInviteAccess] = useState<string>('user')
	const [childGroupCount, setChildGroupCount] = useState<number>(-1)
	const [initialized, setInitialized] = useState<boolean>(false)
	const [members, setMembers] = useState<any[]>([])
	const [isAdmin, setIsAdmin] = useState<boolean>(false)

	let { id } = useParams<{ id: string }>()

	const [present, dismiss] = useIonToast()
	const toast = (message: string, color: string = 'danger') => {
		present({
			color: color,
			message: message,
			cssClass: 'toast',
			buttons: [{ icon: 'close', handler: () => dismiss() }],
			duration: 3000,
		})
	}

	const getInvitations = useCallback(async () => {
		if (!supabaseDataService.isConnected()) {
			await supabaseDataService.connect() // wait for db connection
		}
		if (id && !id.startsWith('new-')) {
			const { data, error } = await supabaseDataService.getInvitations(id)
			if (error) {
				console.error('error getting invitations', error)
			} else {
				console.log('getInvitations', data)
				setInvites(data)
			}
		}
	}, [id])

	useEffect(() => {
		if (initialized) {
			return
		}
		const loadGroup = async (id: string) => {
			if (!supabaseDataService.isConnected()) {
				await supabaseDataService.connect() // wait for db connection
			}
			supabaseDataService
				.getGroup(id)
				.then((group: any) => {
					setGroup(group.data)
				})
				.catch((err: any) => {
					console.error('error getting group', err)
				})

			const count = await supabaseDataService.hasChildGroups(id)
			if (typeof count === 'number') {
				setChildGroupCount(count)
			} else {
				setChildGroupCount(-1)
			}
		}
		const userSubscription = SupabaseAuthService.user.subscribe(setUser)
		if (id && id.startsWith('new-')) {
			console.log('id is', id)
			console.log('parent_id will be', id.substring(4))
			setGroup({ ...group, id: utilityFunctionsService.uuidv4(), parent_id: id.substring(4) })
		} else if (id) {
			loadGroup(id)
			getInvitations()
		} else {
			setGroup({ ...group, id: utilityFunctionsService.uuidv4() })
		}
		setInitialized(true)
		return () => {
			userSubscription.unsubscribe()
		}
	}, [group, id, initialized, getInvitations])

	useEffect(() => {
		const checkMyAccess = async () => {
			const { data, error } = await supabaseDataService.checkMyAccess(id, 'admin')
			if (error) {
				console.error('error getting my access', error)
			} else {
				console.log('checkMyAccess', data)
				if (data) {
					setIsAdmin(true)
				}
			}
		}
		const getMembers = async () => {
			console.log('calling getMembers', id)
			const { data, error } = await supabaseDataService.getGroupMembers(id)
			if (error) {
				console.error('error getting members', error)
			} else {
				console.log('members', data)
				const x = data.map((member: any) => {
					return [
						member.access,
						(member.firstname || '') + ' ' + (member.lastname || ''),
						member.email,
					]
				})
				console.log('x', x)
				setMembers(x)
			}
		}

		if (!id.startsWith('new')) {
			checkMyAccess()
			getMembers()
		}
	}, [group, id])

	useEffect(() => {
		if (user) {
		}
	}, [user])

	useEffect(() => {
		console.log('membersGrid useEffect')
		if (membersGrid.current?.instance) {
			gridService.setClickHandler(membersGrid,(obj: any) => {
				// columnData, columnInfo, rowData
				console.log('membersGrid click')
				console.log('columnData', obj.columnData)
				console.log('columnInfo', obj.columnInfo)
				console.log('rowData', obj.rowData)
			});	
		}
	
	}, [membersGrid.current?.instance])

	const save = async () => {
		if (group.name.trim() === '') {
			toast('Group name is required')
			return
		}
		group.updated_at = 'NOW()'
		const { data, error } = await supabaseDataService.saveGroup(group)
		if (error) {
			console.error('error saving group', error)
		} else {
			if (data) {
				// do nothing here
				history.goBack()
			}
		}
	}
	const doInviteUsers = async () => {
		if (!user.id) {
			toast('You must be logged in to invite users')
			return
		}
		if (inviteUsers.trim() === '') {
			toast('Please enter a user or users to invite')
			return
		}
		const users = inviteUsers.split(',')
		const userEmails = users.map((email: string) => {
			return email.trim()
		})
		if (userEmails.length > 10) {
			toast('Please enter no more than 10 users')
			return
		}
		const { data, error } = await supabaseDataService.inviteUsersToGroup(
			user.id,
			group.id,
			userEmails,
			inviteAccess
		)
		if (error) {
			console.error('error inviting users', error)
			toast('Error inviting users', error.message)
		} else {
			if (data) {
				setInviteUsers('')
				getInvitations()
			}
		}
	}
	const deleteGroup = async () => {
		if (group.id) {
			presentAlert({
				cssClass: 'my-css',
				header: 'Delete Group',
				message: 'Are you sure?',
				buttons: [
					'Cancel',
					{
						text: 'Delete',
						handler: async (d) => {
							const { data, error } = await supabaseDataService.deleteGroup(group.id)
							if (error) {
								console.error('error deleting group', error)
							} else {
								console.log('group deleted, returned', data)
							}
							if (error) {
								console.error('error deleting group', error)
							} else {
								if (data) {
									// do nothing here
									history.goBack()
								}
							}
						},
					},
				],
				onDidDismiss: (e) => console.log('dismissed'),
			})
		} else {
			console.error('missing group id')
		}
	}
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonBackButton defaultHref='/groups' />
					</IonButtons>
					<IonTitle>
						{id?.substring(0, 3) === 'new' ? 'Create New Group' : group?.name! || 'Group'}
					</IonTitle>
					<IonButtons slot='end'>
						<IonButton color='primary' onClick={save}>
							<IonIcon size='large' icon={checkmarkOutline}></IonIcon>
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>

			<IonContent>
				<div className='ion-padding'>
					<IonList>
						<IonItem lines='none'>
							<IonLabel slot='start' class='itemLabel'>
								Name
							</IonLabel>
							<IonInput
								type='text'
								placeholder={'Name'}
								onIonChange={(e: any) => setGroup({ ...group, name: e.detail.value! })}
								value={group?.name!}
								class='inputBox'></IonInput>
						</IonItem>
						<IonItem lines='none'>
							<IonLabel slot='start' class='itemLabel'>
								Description
							</IonLabel>
							<IonInput
								type='text'
								placeholder={'Description'}
								onIonChange={(e: any) => setGroup({ ...group, description: e.detail.value! })}
								value={group?.description!}
								class='inputBox'></IonInput>
						</IonItem>
						<IonItem lines='none'>
							<IonLabel slot='start' class='itemLabel'>
								Sort Order
							</IonLabel>
							<IonInput
								type='text'
								placeholder={'0'}
								onIonChange={(e: any) => setGroup({ ...group, sort_order: e.detail.value! })}
								value={group?.sort_order!}
								class='inputBox'></IonInput>
						</IonItem>
					</IonList>
				</div>
				{id.substring(0, 3) !== 'new' && isAdmin && (
					<div className='ion-padding'>
						<div className='ion-padding' style={{ border: '1px solid' }}>
							<div className='ion-padding'>
								<IonList>
									<IonItemDivider>Invite Users</IonItemDivider>
									<IonItem>
										<IonTextarea
											placeholder='email1@host.com,email2@host.com'
											value={inviteUsers}
											onIonChange={(e) => setInviteUsers(e.detail.value!)}></IonTextarea>
									</IonItem>
									<IonItem>
										<IonLabel>Access Level</IonLabel>
										<IonSelect
											value={inviteAccess}
											placeholder='Select One'
											onIonChange={(e) => setInviteAccess(e.detail.value)}>
											<IonSelectOption value='admin'>admin</IonSelectOption>
											<IonSelectOption value='user'>user</IonSelectOption>
										</IonSelect>
									</IonItem>
								</IonList>
							</div>
							<div className='ion-padding'>
								<IonButton expand='block' color='medium' onClick={doInviteUsers}>
									Invite Users
								</IonButton>
								<IonGrid>
									<IonRow key={'invites_header'}>
										<IonCol>
											<b>Email</b>
										</IonCol>
										<IonCol>
											<b>Created At</b>
										</IonCol>
										<IonCol>
											<b>Result</b>
										</IonCol>
									</IonRow>
									{invites.map((invite: any) => {
										const created_at = new Date(invite.created_at)
										return (
											<IonRow key={invite.id}>
												<IonCol>{invite.email}</IonCol>
												<IonCol>{created_at.toLocaleString()}</IonCol>
												<IonCol>{invite.result || 'pending'}</IonCol>
											</IonRow>
										)
									})}
								</IonGrid>
							</div>
						</div>
						<Grid
							ref={membersGrid}
							data={members}
							columns={['Access', 'Name', 'Email']}
							search={true}
							sort={true}
							pagination={{
								enabled: true,
								limit: 4,
							}}
							language={{'search':'????  Search...'}}
						/>
					</div>
				)}
			</IonContent>
			{childGroupCount === 0 && isAdmin && (
				<IonFooter>
					<div className='ion-padding'>
						<IonButton expand='block' color='danger' onClick={deleteGroup}>
							Delete Group
						</IonButton>
					</div>
				</IonFooter>
			)}
		</IonPage>
	)
}

export default Group
