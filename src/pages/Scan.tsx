import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useState } from 'react';
import { QrReader } from 'react-qr-reader';
//import { useParams } from 'react-router';
//import ExploreContainer from '../components/ExploreContainer';
import './Scan.css';

const Scan: React.FC = () => {
    const [data, setData] = useState('No result');
  // const { name } = useParams<{ name: string; }>();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref='/dashboard' />
          </IonButtons>
          <IonTitle>Scan QR Code</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <QrReader
            onResult={(result: any, error: any) => {
            if (result) {
                setData(result?.text);
            } else if (error) {
                console.error(error);
            }
            }}
            constraints={{facingMode: 'environment'}}
            //style={{ width: '100%' }}            
        />
      <p>{data}</p>          
      </IonContent>
    </IonPage>
  );
};

export default Scan;
