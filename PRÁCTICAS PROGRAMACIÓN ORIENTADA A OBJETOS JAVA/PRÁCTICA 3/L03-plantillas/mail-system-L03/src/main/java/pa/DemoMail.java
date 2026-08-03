/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package pa;

/**
 *
 * @author eli
 */
public class DemoMail {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        MailServer servidorDeCorreo;
        MailClient cliente1, cliente2;
        String usuario1 = "Pablo Garcia";
        String usuario2 = "Esther Roca";
        
        //creamos el servidor de correo
        servidorDeCorreo = new MailServer();
        //creamos los clientes del servidor de correo
        cliente1 = new MailClient(servidorDeCorreo, usuario1);
        cliente2 = new MailClient(servidorDeCorreo, usuario2);
        
        cliente1.sendMailItem(usuario2,"Hola Esther. Llegaré 10 minutos tarde");
        cliente2.printNextMailItem();
        
        cliente2.sendMailItem(usuario1,"Hola Pablo. No te preocupes, te esperamos");
        cliente1.printNextMailItem();
        
        cliente1.sendMailItem(usuario2,"Hola Esther. Muchas gracias!!");
        cliente2.printNextMailItem();
      
    }
    
}
