/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package pa;


public class PruebaMaquinas {
    public static void main(String[] args) {
    	TicketMachine t1= new TicketMachine(20);
    	TicketMachine t2=new TicketMachine(30);
    	TicketMachine t3=new TicketMachine(40);
    	System.out.println("Maquina 1. Precio ticket =" + t1.getPrice());
    	System.out.println("Maquina 2. Precio ticket =" + t2.getPrice());
    	System.out.println("Maquina 3. Precio ticket =" + t3.getPrice());
    	
    	
    	System.out.println("Maquina 1. Insertamos 20");
    	t1.insertMoney(20);
    	System.out.println("Maquina 1. Insertamos 20");
    	t1.insertMoney(20);
    	System.out.println("Maquina 1. Valor de las monedas insertadas: " + t1.getBalance());
    	System.out.println("Maquina 1. Solicitamos ticket");
    	t1.printTicket();
    	t1.refundBalance();
    	System.out.println("Maquina 1. Insertamos 20");
    	t1.insertMoney(20);
    	System.out.println("Maquina 1. Insertamos 20");
    	t1.insertMoney(20);
    	System.out.println("Maquina 1. Valor de las monedas insertadas: " + t1.getBalance());
    	System.out.println("Maquina 1. Solicitamos ticket");
    	t1.printTicket();
    	System.out.println(t1.getTotal());
    	
    	//--------------------------------------------------------------------------------
    	System.out.println("Maquina 2. Insertamos 10");
    	t2.insertMoney(10);
    	System.out.println("Maquina 2. Insertamos 30");
    	t2.insertMoney(30);
    	System.out.println("Maquina 2. Valor de las monedas insertadas: " + t2.getBalance());
    	System.out.println("Maquina 2. Solicitamos ticket");
    	t2.printTicket();
    	t2.refundBalance();
    	//----------------------------------------------------------------------------------
    	System.out.println("Maquina 3. Insertamos 20");
    	t3.insertMoney(20);
    	System.out.println("Maquina 3. Insertamos 30");
    	t3.insertMoney(30);
    	System.out.println("Maquina 3. Valor de las monedas insertadas: " + t3.getBalance());
    	System.out.println("Maquina 3. Solicitamos ticket");
    	t3.printTicket();
    	t3.refundBalance();
    	
    	
        
    	
                     
    }
    
}
