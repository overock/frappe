import Frappe from '../js/frappe.js';

let frappe = new Frappe(document.getElementById('test-canvas'));
    
// for demo
window.$f = frappe;

const startDemo = () => {
    // just 4 test
    frappe.add('start', 100, 100), frappe.add('end', 100, 800), frappe.add('kill', 500, 300);
};

startDemo();

frappe.subscribe('frappe.edit', e => alert(e.detail.uuid));