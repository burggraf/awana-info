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
import {QRCodeCanvas} from 'qrcode.react';

//import { useParams } from 'react-router';
//import ExploreContainer from '../components/ExploreContainer';
import './Report.css'
const reportService = ReportService.getInstance()

const Report: React.FC = () => {
	
	const generateHTMLreport = () => {
		const x: HTMLElement | null = document.getElementById('test');
		reportService.generateHTMLreport(x, {filename: 'report1'});

	}
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
				<IonButton onClick={generateReport}>Generate Report</IonButton><br/>
				<IonButton onClick={generateHTMLreport}>Generate HTML Report</IonButton><br/>
				{/* <div id="test" style={{width:'5in',height:'5in',maxHeight:'5in',maxWidth:'5in'}}> */}
				<div id="test">
					<h1>Test</h1>
					<table style={{width:'100%'}}>
						<thead>
							<tr style={{fontWeight:'bold'}}>
								<td>Name</td>
								<td>Email</td>
								<td>Country</td>
								<td>code</td>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>David Castlerock</td>
								<td>askdjf@kasdjf.com</td>
								<td>Sweden</td>
								<td>
								<QRCodeCanvas style={{width:'0.5in',height:'0.5in'}} 
									value="https://google.com/" 
								/>
								</td>
							</tr>								
						</tbody>		
					</table>
				</div>
			</IonContent>
		</IonPage>
	)
}

export default Report
