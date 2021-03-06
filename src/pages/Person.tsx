import {
	IonBackButton,
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonIcon,
	IonInput,
	IonLabel,
	IonLoading,
	IonPage,
	IonTextarea,
	IonTitle,
	IonToolbar,
} from '@ionic/react'
// import { User } from '@supabase/supabase-js'
// import { SupabaseAuthService } from 'ionic-react-supabase-login';
import { checkmarkOutline } from 'ionicons/icons'
import { useCallback, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router'

import { Address as AddressObject } from '../../models/Models'
import { Person as PersonObject } from '../../models/Person'
import Address from '../components/Address'
// import CommentsList from '../components/CommentsList';
import GenericItemArrayEntry from '../components/GenericItemArrayEntry'
import SupabaseDataService from '../services/supabase.data.service'
import UtilityFunctionsService from '../services/utility.functions.service'

//import "../translations/i18n";
import './Person.css'

const instantMessageTypes: any = [
	{ value: 'WhatsApp' },
	{ value: 'Business Suite' },
	{ value: 'Zoom' },
	{ value: 'Amazon Alexa' },
	{ value: 'Messenger' },
	{ value: 'Skype' },
	{ value: 'Slack' },
	{ value: 'Discord' },
	{ value: 'GitHub' },
	{ value: 'Instagram' },
	{ value: 'Twitter' },
	{ value: 'Facebook' },
	{ value: 'AnyDesk' },
	{ value: 'Voice' },
	{ value: 'Gmail' },
	{ value: 'Spark' },
	{ value: 'MSN' },
	{ value: 'Google Talk' },
	{ value: 'Facebook' },
	{ value: 'AIM' },
	{ value: 'Yahoo' },
	{ value: 'ICQ' },
	{ value: 'Jabber' },
	{ value: 'QQ' },
	{ value: 'Gadu-Gadu' },
	{ value: 'Other' },
]
const socialProfileTypes: any = [
	{ value: 'WhatsApp' },
	{ value: 'Business Suite' },
	{ value: 'Zoom' },
	{ value: 'Amazon Alexa' },
	{ value: 'Messenger' },
	{ value: 'Skype' },
	{ value: 'Slack' },
	{ value: 'Discord' },
	{ value: 'GitHub' },
	{ value: 'Instagram' },
	{ value: 'Twitter' },
	{ value: 'Facebook' },
	{ value: 'AnyDesk' },
	{ value: 'Voice' },
	{ value: 'Gmail' },
	{ value: 'Spark' },
	{ value: 'Flickr' },
	{ value: 'LinkedIn' },
	{ value: 'YouTube' },
	{ value: 'Website' },
	{ value: 'Sina Weibo' },
	{ value: 'Other' },
]

const supabaseDataService = SupabaseDataService.getInstance()
const utils = UtilityFunctionsService.getInstance()

const Person: React.FC = () => {
	const history = useHistory()
	const [showLoading, setShowLoading] = useState(true)
	const [showExpanded, setShowExpanded] = useState(false)

	let { id } = useParams<{ id: string }>()
	const isNew = id === 'new'

	const [person, setPerson] = useState<PersonObject>({ id, address: [] })

	// const [ user, setUser ] = useState<any>(null);
	// const [ profile, setProfile ] = useState<any>(null);

	const init = useCallback(() => {
		const loadPerson = async (id: string) => {
			console.log('loadPerson...')
			const { data, error } = await supabaseDataService.getPerson(id)
			console.log('loadPerson...', data, 'error', error)
			if (error) {
				console.error('loadPerson error', error)
			} else {
				console.log('loadPerson data', data)
				setPerson(data)
			}
			setShowLoading(false)
		}
		if (id === 'new') {
			// id = utils.uuidv4();
			const initPerson = { id, address: [] }
			setPerson({ ...initPerson, id: utils.uuidv4() })
			setShowLoading(false)
		} else {
			loadPerson(id)
		}
	}, [id])

	useEffect(() => {
		init()
		// const userSubscription = SupabaseAuthService.subscribeUser(setUser);
		// const profileSubscription = SupabaseAuthService.subscribeProfile(setProfile);
		return () => {
			// SupabaseAuthService.unsubscribeUser(userSubscription);
			// SupabaseAuthService.unsubscribeProfile(profileSubscription);
		}
	}, [init])

	const changeHandler = (e: any) => {
		const fld = e.srcElement.itemID
		setPerson({ ...person, [fld]: e.detail.value! })
	}
	const saveItem = (id: string, data: any, index: number) => {
		const newPerson: any = { ...person }
		if (!newPerson[id]) {
			newPerson[id] = []
		}
		if (index === -1) {
			index = newPerson[id].length
		}
		newPerson[id][index] = data
		setPerson(newPerson)
	}
	const deleteItem = (id: string, data: any, index: number) => {
		console.log('deleteItem', id, data, index)
		const newPerson: any = { ...person }
		if (newPerson[id] && newPerson[id].length >= index - 1) {
			newPerson[id].splice(index, 1)
		}
		setPerson(newPerson)
	}
	const savePerson = async () => {
		const { data, error } = await supabaseDataService.savePerson(person)
		console.log('savePerson: data', data, 'error', error)
	}

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonBackButton defaultHref='/people' />
					</IonButtons>
					<IonTitle>Person Details</IonTitle>
					<IonButtons slot='end'>
						<IonButton color='primary' onClick={savePerson}>
							<IonIcon size='large' icon={checkmarkOutline}></IonIcon>
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>

			<IonContent className='ion-padding'>
				<IonLoading isOpen={showLoading} message='Loading' />
				<table className='tbl'>
					<tbody>
						<tr>
							<td>&nbsp;</td>
							<td>
								<IonButton
									size='small'
									expand='block'
									color='primary'
									onClick={() => {
										setShowExpanded(!showExpanded)
									}}>
									{showExpanded ? 'Hide' : 'Show'} Details
								</IonButton>
							</td>
						</tr>
						<tr>
							<td className='labelColumn'>
								<IonLabel class='itemLabel'>First Name</IonLabel>
							</td>
							<td>
								<IonInput
									type='text'
									placeholder={'First Name'}
									itemID='firstname'
									onIonChange={changeHandler}
									value={person?.firstname!}
									class='inputBox'></IonInput>
							</td>
						</tr>
						{showExpanded && (
							<tr>
								<td className='labelColumn'>
									<IonLabel class='itemLabel'>Middle Name</IonLabel>
								</td>
								<td>
									<IonInput
										type='text'
										placeholder={'Middle Name'}
										itemID='middlename'
										onIonChange={changeHandler}
										value={person?.middlename!}
										class='inputBox'></IonInput>
								</td>
							</tr>
						)}
						<tr>
							<td className='labelColumn'>
								<IonLabel class='itemLabel'>Last Name</IonLabel>
							</td>
							<td>
								<IonInput
									type='text'
									placeholder={'Last Name'}
									itemID='lastname'
									onIonChange={changeHandler}
									value={person?.lastname!}
									class='inputBox'></IonInput>
							</td>
						</tr>
						{showExpanded && (
							<>
								<tr>
									<td className='labelColumn'>
										<IonLabel class='itemLabel'>Nickname</IonLabel>
									</td>
									<td>
										<IonInput
											type='text'
											placeholder={'Nickname'}
											itemID='nickname'
											onIonChange={changeHandler}
											value={person?.nickname!}
											class='inputBox'></IonInput>
									</td>
								</tr>
								<tr>
									<td className='labelColumn'>
										<IonLabel class='itemLabel'>Company</IonLabel>
									</td>
									<td>
										<IonInput
											type='text'
											placeholder={'Company'}
											itemID='company'
											onIonChange={changeHandler}
											value={person?.company!}
											class='inputBox'></IonInput>
									</td>
								</tr>

								<tr>
									<td className='labelColumn'>
										<IonLabel class='itemLabel'>Birthdate</IonLabel>
									</td>
									<td>
										<IonInput
											type='date'
											itemID='dob'
											onIonChange={changeHandler}
											value={person?.dob!}
											class='inputBox'
										/>
									</td>
								</tr>

								<tr>
									<td className='labelColumn'>
										<IonLabel class='itemLabel'>Anniversary</IonLabel>
									</td>
									<td>
										<IonInput
											type='date'
											itemID='anniversary'
											onIonChange={changeHandler}
											value={person?.anniversary!}
											class='inputBox'
										/>
									</td>
								</tr>

								<tr>
									<td className='labelColumn'>
										<IonLabel class='itemLabel'>
											Address
											<br />
											<Address data={{ ownerid: id }} index={-1} saveFunction={saveItem} />
										</IonLabel>
									</td>
									<td>
										<table className='multiBox'>
											<tbody>
												{person?.address?.map((address: AddressObject, index: number) => {
													return (
														<tr key={`address_${index}`}>
															<td className='multiBoxEntry'>
																<IonLabel>
																	{address.type && <div>Type: {address.type}</div>}
																	{address.name && <div>Location: {address.name}</div>}
																	{address.address && <div>{address.address}</div>}
																	{address.address2 && <div>{address.address2}</div>}
																	{address.city && <div>City: {address.city}</div>}
																	{address.province && <div>Province: {address.province}</div>}
																	{address.postalcode && <div>Postal: {address.postalcode}</div>}
																	{address.country && <div>Country: {address.country}</div>}
																	{address.pluscode && <div>PlusCode: {address.pluscode}</div>}
																	{address.latitude && (
																		<div>
																			Lat/Lng: {address.latitude},{address.longitude}
																		</div>
																	)}
																</IonLabel>
															</td>
															<td className='ion-text-right'>
																<IonLabel>
																	<Address
																		data={address}
																		index={index}
																		saveFunction={saveItem}
																		deleteFunction={deleteItem}
																	/>
																</IonLabel>
															</td>
														</tr>
													)
												})}
											</tbody>
										</table>
									</td>
								</tr>

								<tr>
									<td className='labelColumn'>
										<IonLabel class='itemLabel'>
											Email Address
											<br />
											<GenericItemArrayEntry
												title='Email Address'
												id={'email'}
												attributes={[{ name: 'email', placeholder: 'Email Address' }]}
												types={[
													{ value: 'home' },
													{ value: 'work' },
													{ value: 'school' },
													{ value: 'iCloud' },
													{ value: 'other' },
												]}
												data={null}
												index={-1}
												saveFunction={saveItem}
											/>
										</IonLabel>
									</td>
									<td>
										<table className='multiBox'>
											<tbody>
												{person?.email?.map((email: any, index: number) => {
													return (
														<tr key={`email_${index}`}>
															<td className='multiBoxEntry'>
																<IonLabel>
																	Type: {email.type}
																	<br />
																	Email: {email.email}
																</IonLabel>
															</td>
															<td className='ion-text-right'>
																<IonLabel>
																	<GenericItemArrayEntry
																		title='Email Address'
																		id={'email'}
																		attributes={[{ name: 'email', placeholder: 'Email Address' }]}
																		types={[
																			{ value: 'home' },
																			{ value: 'work' },
																			{ value: 'school' },
																			{ value: 'iCloud' },
																			{ value: 'other' },
																		]}
																		data={email.email}
																		index={index}
																		deleteFunction={deleteItem}
																		saveFunction={saveItem}
																	/>
																</IonLabel>
															</td>
														</tr>
													)
												})}
											</tbody>
										</table>
									</td>
								</tr>

								<tr>
									<td className='labelColumn'>
										<IonLabel class='itemLabel'>
											Web URL
											<br />
											<GenericItemArrayEntry
												title='Web URL'
												id={'url'}
												attributes={[{ name: 'url', placeholder: 'URL' }]}
												types={[
													{ value: 'homepage' },
													{ value: 'home' },
													{ value: 'work' },
													{ value: 'school' },
													{ value: 'other' },
												]}
												data={null}
												index={-1}
												saveFunction={saveItem}
											/>
										</IonLabel>
									</td>
									<td>
										<table className='multiBox'>
											<tbody>
												{person?.url?.map((item: any, index: number) => {
													return (
														<tr key={`url${index}`}>
															<td className='multiBoxEntry'>
																<IonLabel>
																	Type: {item.type}
																	<br />
																	Email: {item.email}
																</IonLabel>
															</td>
															<td className='ion-text-right'>
																<IonLabel>
																	<GenericItemArrayEntry
																		title='Web URL'
																		id={'url'}
																		attributes={[{ name: 'url', placeholder: 'URL' }]}
																		types={[
																			{ value: 'homepage' },
																			{ value: 'home' },
																			{ value: 'work' },
																			{ value: 'school' },
																			{ value: 'other' },
																		]}
																		data={item}
																		index={index}
																		deleteFunction={deleteItem}
																		saveFunction={saveItem}
																	/>
																</IonLabel>
															</td>
														</tr>
													)
												})}
											</tbody>
										</table>
									</td>
								</tr>

								<tr>
									<td className='labelColumn'>
										<IonLabel class='itemLabel'>
											Social Profile
											<br />
											<GenericItemArrayEntry
												title='Social Profile'
												id={'socialprofile'}
												attributes={[{ name: 'url', placeholder: 'Social Profile URL' }]}
												types={socialProfileTypes}
												data={null}
												index={-1}
												saveFunction={saveItem}
											/>
										</IonLabel>
									</td>
									<td>
										<table className='multiBox'>
											<tbody>
												{person?.socialprofile?.map((item: any, index: number) => {
													return (
														<tr key={`socialprofile_${index}`}>
															<td className='multiBoxEntry'>
																<IonLabel>
																	Type: {item.type}
																	<br />
																	URL: {item.url}
																</IonLabel>
															</td>
															<td className='ion-text-right'>
																<IonLabel>
																	<GenericItemArrayEntry
																		title='Social Profile'
																		id={'socialprofile'}
																		attributes={[
																			{ name: 'url', placeholder: 'Social Profile URL' },
																		]}
																		types={socialProfileTypes}
																		data={item}
																		index={index}
																		deleteFunction={deleteItem}
																		saveFunction={saveItem}
																	/>
																</IonLabel>
															</td>
														</tr>
													)
												})}
											</tbody>
										</table>
									</td>
								</tr>

								<tr>
									<td className='labelColumn'>
										<IonLabel class='itemLabel'>
											Instant Message
											<br />
											<GenericItemArrayEntry
												title='Instant Message'
												id={'instantmessage'}
												attributes={[{ name: 'handle', placeholder: 'Instant Message Handle' }]}
												types={instantMessageTypes}
												data={null}
												index={-1}
												saveFunction={saveItem}
											/>
										</IonLabel>
									</td>
									<td>
										<table className='multiBox'>
											<tbody>
												{person?.instantmessage?.map((item: any, index: number) => {
													return (
														<tr key={`instantmessage${index}`}>
															<td className='multiBoxEntry'>
																<IonLabel>
																	Type: {item.type}
																	<br />
																	Handle: {item.handle}
																</IonLabel>
															</td>
															<td className='ion-text-right'>
																<IonLabel>
																	<GenericItemArrayEntry
																		title='Instant Message'
																		id={'instantmessage'}
																		attributes={[
																			{ name: 'handle', placeholder: 'Instant Message Handle' },
																		]}
																		types={instantMessageTypes}
																		data={item}
																		index={index}
																		deleteFunction={deleteItem}
																		saveFunction={saveItem}
																	/>
																</IonLabel>
															</td>
														</tr>
													)
												})}
											</tbody>
										</table>
									</td>
								</tr>

								<tr>
									<td className='labelColumn'>
										<IonLabel class='itemLabel'>Notes</IonLabel>
									</td>
									<td>
										<IonTextarea
											placeholder={'Notes'}
											itemID='notes'
											autoGrow={true}
											inputMode='text'
											onIonChange={changeHandler}
											value={person?.notes!}
											rows={3}
											class='inputBox'></IonTextarea>
									</td>
								</tr>
							</>
						)}
					</tbody>
				</table>
				{!isNew && (
					<div className='ion-padding'>
						<IonButton
							fill='clear'
							expand='block'
							strong
							color='danger'
							onClick={async () => {
								const { data, error } = await supabaseDataService.deletePerson(id)
								if (error) {
									console.error('deletePerson error', error)
									return
								} else {
									console.log('data', data)
									history.replace('/people')
								}
							}}>
							delete
						</IonButton>
					</div>
				)}
				{/* <CommentsList topic={`person/${id}`}/> */}
				{/* <pre>
                {JSON.stringify(person, null, 2)}
            </pre> */}
			</IonContent>
		</IonPage>
	)
}

export default Person
