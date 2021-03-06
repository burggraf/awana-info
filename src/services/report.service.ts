//import * as moment from 'moment';
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default class ReportService {
    static myInstance: any = null;

    static getInstance() {
        if (this.myInstance === null) {
            this.myInstance = new this();
        }
        return this.myInstance;
    }

    // constructor() {}
	public generateHTMLreport = (html_obj: HTMLElement, config: any) => {
		var doc: any = new jsPDF('p', 'pt', 'letter');
        const f = (config.filename || 'report') + '.pdf';

		doc.html(html_obj, {
		   callback: function (doc: any) {
                if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())) {
                     doc.save(f)
                } else {
                    window.open(doc.output('bloburl', { filename: f }), '_blank');
                }                
 		   },
		   x: 30,
		   y: 0,
 		});		

         // window.open(doc.output('bloburl', { filename: f }), '_blank');

         //window.open(doc.output('datauristring', { filename: f }), '_blank');
        //doc.output('dataurlnewwindow');

        //doc.save(f)
        // doc.output('dataurlnewwindow');
        //doc.output('dataurlnewwindow', {filename: f});
        //window.open(f);
        //window.open(doc.output('datauristring', { filename: f }), '_blank');


        
        //window.open(doc.output('dataurlstring', { filename: f }), '_blank');


    }

    /**
     * **************
     * generateReport
     * **************
     * obj.data - array of data
     * obj.head - array or column names
     * obj.title - title of report
     * obj.filename - filename of report (without extension)
     */
    public generateReport = (obj: any) => {
        const doc: any /*jsPDF*/ = new jsPDF()
        var totalPagesExp = '{total_pages_count_string}'
        const data = obj.data || [];

        const base64Img = null
        autoTable(doc, {
            head: obj.head,
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
                doc.text(obj.title || 'Report', data.settings.margin.left, 22)

                // Footer
                var str = 'Page ' + doc.internal.getNumberOfPages()
                // Total page number plugin only available in jspdf v1.0+
                if (typeof doc.putTotalPages === 'function') {
                    str = str + ' of ' + totalPagesExp
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
        // console.log('datauristring', doc.output('datauristring'));
        const f = (obj.filename || obj.title || 'report') + '.pdf';
        // doc.save(f)
        // doc.output('dataurlnewwindow');

        window.open(doc.output('bloburl', { filename: f }), '_blank');
        //return doc;
    }

}