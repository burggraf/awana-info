import { IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonLabel, IonLoading, IonMenuButton, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
// import { User } from '@supabase/supabase-js'
//import { SupabaseAuthService } from 'ionic-react-supabase-login';
import { addOutline, addSharp, peopleOutline, peopleSharp } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { Grid } from 'gridjs-react'

import { Person as PersonObject } from '../../models/Person'
import SupabaseDataService from '../services/supabase.data.service'
import GridService from '../services/grid.service'

// import description from '../../package.json';
// import version from '../../package.json';

//import "../translations/i18n";
import './People.css';

const supabaseDataService = SupabaseDataService.getInstance()
const gridService = GridService.getInstance()

const People: React.FC = () => {
    const history = useHistory();
    const peopleGrid: any = useRef(null)

    const [showLoading, setShowLoading] = useState(true);
    // const [ people, setPeople ] = useState<PersonObject[]>([]);
    const [ people, setPeople ] = useState<any[]>([]);

    // const [ user, setUser ] = useState<any>(null);
    // const [ profile, setProfile ] = useState<any>(null);
    
    useEffect(() => {
      const loadPeople = async () => {
        const { data, error } = await supabaseDataService.getPeople();
        if (error) { 
            console.error('loadPeople: error', error)
        } else {
            setPeople(data);
            console.log('peoplel set to',data);

        }
        setShowLoading(false);
      }
      loadPeople();
      // const userSubscription = SupabaseAuthService.subscribeUser(setUser);
      // const profileSubscription = SupabaseAuthService.subscribeProfile(setProfile);

      // gridService.setRowClickHandler(peopleGrid,(cells: any[]) => {
      //   history.push(`/person/${cells[0]}`);
      // });
      gridService.setClickHandler(peopleGrid,(obj: any) => {
        // columnData, columnInfo, rowData
        history.push(`/person/${obj.rowData[0]}`);
      });

      return () => {
          // SupabaseAuthService.unsubscribeUser(userSubscription);
          // SupabaseAuthService.unsubscribeProfile(profileSubscription);
      }
    },[history])
   
    return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
            <IonTitle>
                <IonIcon size="large" ios={peopleOutline} md={peopleSharp}></IonIcon>
              &nbsp;&nbsp;People
            </IonTitle>
            <IonButtons slot='end'>
                <IonButton color='dark' onClick={() => {history.push('/person/new')}}>
                    <IonIcon size='large' ios={addOutline} md={addSharp}></IonIcon>
                </IonButton>
            </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent class="ion-padding">

      <IonLoading isOpen={showLoading} message="Loading" />

      <Grid
              key={'peopleGrid'}
							ref={peopleGrid}
							data={people}
							columns={[
                {name:'id',id:'id',hidden:true},
                {name:'Firstname',id:'firstname'},
                {name:'Lastname',id:'lastname'},
							]}
							search={true}
							sort={true}
							pagination={{
								enabled: true,
								limit: 15,
							}}
						/>

        <IonGrid key={'peopleList'}>
            {people.map((person: PersonObject) => {
                return (
                    <IonRow key={person.id} onClick={()=>{history.push(`/person/${person.id}`)}}>
                        <IonCol>
                            <IonLabel>
                                {`${person.firstname || ''} ${person.middlename || ''} ${person.lastname || ''}`}
                            </IonLabel>
                        </IonCol>
                    </IonRow>
                )
            })}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default People;
