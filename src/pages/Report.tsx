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
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

//import { useParams } from 'react-router';
//import ExploreContainer from '../components/ExploreContainer';
import './Report.css'

const Report: React.FC = () => {
	const generateReport = () => {
		const doc: any /*jsPDF*/ = new jsPDF()
		var totalPagesExp = '{total_pages_count_string}'
		const data = [
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
		]
		data.push(...data)
		data.push(...data)
		data.push(...data)

		const base64Img = null
		autoTable(doc, {
			head: [['Name', 'Email', 'Country']],
			body: data,
            headStyles: { fillColor: [211, 211, 211], textColor: 'black' }, // lightgray
			didDrawPage: function (data) {
				// Header
				doc.setFontSize(20)
				doc.setTextColor(40)
				if (base64Img) {
					doc.addImage(base64Img, 'JPEG', data.settings.margin.left, 15, 10, 10)
				}
				//doc.text('Test Report with multiple pages', data.settings.margin.left + 15, 22)
				doc.text('Test Report with multiple pages', data.settings.margin.left, 22)

				// Footer

				var str = 'Page ' + doc.internal.getNumberOfPages()
				// Total page number plugin only available in jspdf v1.0+
				if (typeof doc.putTotalPages === 'function') {
					console.log('doc.putTotalPages is a function')
					str = str + ' of ' + totalPagesExp
				} else {
					console.log('doc.putTotalPages is a NOT a function')
				}
				doc.setFontSize(10)

				// jsPDF 1.4+ uses getWidth, <1.4 uses .width
				var pageSize = doc.internal.pageSize
				var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight()
				doc.text(str, data.settings.margin.left, pageHeight - 10)
			},
			margin: { top: 30 },
		})
		// Total page number plugin only available in jspdf v1.0+
		if (typeof doc.putTotalPages === 'function') {
			doc.putTotalPages(totalPagesExp)
		}
		doc.save('table.pdf')
	}

	// const { name } = useParams<{ name: string; }>();

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonBackButton defaultHref='/login' />
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
