declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      [key: string]: any;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance;
    from(element: HTMLElement | Element): Html2PdfInstance;
    save(): void;
    output(type?: string, options?: any): any;
    then(callback: Function): Html2PdfInstance;
    catch(callback: Function): Html2PdfInstance;
  }

  function html2pdf(): Html2PdfInstance;
  function html2pdf(element: HTMLElement | Element): Html2PdfInstance;
  function html2pdf(element: HTMLElement | Element, options: Html2PdfOptions): Html2PdfInstance;
  
  export default html2pdf;
} 