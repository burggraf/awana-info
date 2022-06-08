import {
	IonBackButton,
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonPage,
	IonTitle,
	IonToolbar,
} from '@ionic/react'
import ReportService from '../services/report.service'

//import { useParams } from 'react-router';
//import ExploreContainer from '../components/ExploreContainer';
import './Report.css'
const reportService = ReportService.getInstance()

const Report: React.FC = () => {
	const generateReport = () => {
        const obj = {
            title: 'My Report',
            head: [['Name', 'Email', 'Country']],
            data: [
                ['David Castlerock', 'david@example.com', 'Sweden'],
                ['Castille Buenos', 'castille@example.com', 'Spain'],
                ['John Hovington', 'asdfj@kajdf.com', 'USA'],
                ['Sara Smith', 'sarasmith@gtownlist.cc', 'USA'],
                ['George Washington', 'g@gmail.com', 'USA'],
                ['John Adams', 'john_adams_i@wonderbuddy.net', 'USA'],
                ['John Doe', 'john_z_doe@kadsfkj.com', 'USA'],
                ['John Smith', 'john_smith@gazaba.org', 'United Kingdom'],
                ['Peter Parker', 'pparker@hotmail.com', 'United States'],
                ['Jim Jones', 'jjones@me.com', 'Canada'],
                ['Franklin Delano', 'fdr@homebase.io', 'United States'],
                ['Alice Cooper', 'abccooper1@gmail.com', 'United States'],
                ['Betty White', 'bwchambermusic@alliance.org', 'United States'],
            ],
            filename: 'my_report'
        }
        reportService.generateReport(obj);
    }
	// const { name } = useParams<{ name: string; }>();

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonBackButton defaultHref='/dashboard' />
					</IonButtons>
					<IonTitle>Report Test</IonTitle>
				</IonToolbar>
			</IonHeader>

            <IonContent className="ion-padding">
				<IonButton onClick={generateReport}>Generate Report</IonButton>
			</IonContent>
		</IonPage>
	)
}

export default Report
