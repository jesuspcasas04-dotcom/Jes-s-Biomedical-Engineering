package pa;

/**
 * TicketMachine models a naive ticket machine that issues
 * flat-fare tickets.
 * The price of a ticket is specified via the constructor.
 * It is a naive machine in the sense that it trusts its users
 * to insert enough money before trying to print a ticket.
 * It also assumes that users enter sensible amounts.
 *
 * @author David J. Barnes and Michael Kölling
 * @version 2016.02.29
 */
public class TicketMachine
{
    // The price of a ticket from this machine.
    private int price;
    // The amount of money entered by a customer so far.
    private int balance;
    // The total amount of money collected by this machine.
    private int total;
    private int balance2;
    private int totalprecio;

   

    /**
     * Create a machine that issues tickets of the given price.
     * Note that the price must be greater than zero, and there
     * are no checks to ensure this.
     */
    public TicketMachine(int cost)
    {
        price = cost;
        balance = 0;
        total = 0;
   
    }

    /**
     * Return the price of a ticket.
     */
    public int getPrice()
    {
        return price;
    }

    /**
     * Return the amount of money already inserted for the
     * next ticket.
     */
    public int getBalance()
    {
        return balance;
    }

    /**
     * Receive an amount of money from a customer.
     */
    public void insertMoney(int amount)
    {
    	if (amount>=0) {
    		balance = balance + amount;
    		
    	}
    	else {
    		System.out.println("La cantidad introducida es negativa, por favor introduzca otra cantidad");
    	}
        
    }
    

    /**
     * Print a ticket.
     * Update the total collected and
     * reduce the balance to zero.
     */
    public void printTicket(){ 
    	int balance2=0;
    	int cuantos=0;
    	
    	if (balance>=price) {
    		cuantos=balance/price;
    		balance=balance-(price*cuantos);
    		total+=cuantos;
    		totalprecio+=cuantos*price;
    		
    		System.out.println("####### IMPRIMIENDO TICKET###### " + cuantos + " ticket/s impresos");
    		System.out.println("Te quedan " + balance + " para solicitarlos utiliza el comando refundbalance");

    	}
    	else {
    		balance2=price-balance;
    		balance=balance-price;
    		
    		System.out.println("Te faltan " + balance2 + " céntimos, por favor introduzcalos con inserMoney");
    		
    	}
    	
        
    }  
    
    
    public int getTotal() {
    	System.out.println("Ya han sido comprados " + total+ " tickets y te has gastado "+ totalprecio + " centimos");
        return total;
    }
    public int refundBalance() {
    	if (balance>0) {
    		System.out.println(balance+" centimos devueltos");
    		return balance;
    		
    	}
    	if (balance==0) {
    		System.out.println("Tu saldo es de 0");
    		return balance;
    		
    	}
    	else {
    		System.out.println("Devolviendo " + (balance+price) + " céntimos");
    		return (balance+price);
    	}
    }
    
    
}
    
