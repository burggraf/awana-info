import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

//import { useParams } from 'react-router';
//import ExploreContainer from '../components/ExploreContainer';
import './SelectDefaultGroup.css';

const SelectDefaultGroup: React.FC = () => {

  // const { name } = useParams<{ name: string; }>();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref='/dashboard' />
          </IonButtons>
          <IonTitle>Select Default Group</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

      </IonContent>
    </IonPage>
  );
};

export default SelectDefaultGroup;
