package pa;
import pa.network.PhotoPost;
import pa.network.MessagePost;
import pa.network.NewsFeed;
public class Demo1 {
	public static void main (String [] args) {
		MessagePost mp1=new MessagePost("Mario", "Me voy a la uni");
		PhotoPost pp1 = new PhotoPost ("Juan", "src/main/resources/imagenes/leopardo.jpg","Angry leo");
		MessagePost mp2 =new MessagePost ("Jose", "I love you");
		mp1.like();
		mp1.like();
		for (int i=1;i<=30;i++) {
			mp2.like();
		}
		pp1.addComment("Que fotico mas bonica");
		pp1.addComment("Que foto mas rancia");
		
		
		
		NewsFeed nf = new NewsFeed();
		nf.addMessagePost(mp1);
		nf.addMessagePost(mp2);
		nf.addPhotoPost(pp1);
		nf.show();
		
		for (int i=1;i<=7;i++) {
			mp1.addComment("Comentario "+ i);
			
		}
		for (int i=1;i<=10;i++) {
			pp1.addComment("Comentario Photo " + i );
		}
		for(int i=1;i<=31;i++) {
			pp1.like();
		}
		nf.show();
		
		
	}

}
