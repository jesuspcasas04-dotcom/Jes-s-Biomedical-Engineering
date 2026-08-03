%Números complejos
n= 2.3+ 2j;


%n2=2.3+j2 --> Error ya que el número complejo i o j se escribe al final si
%no queremos poner la multiplicación.

t= 1+ j*1;


m= 0.6-2j;
% Si escribimos la multiplicación si que podremos representar nuestro
% número complejo.

modulo= abs(t);
fase=angle(t);
% Con los comandos abs y angle podremos sacar el módulo y la fase de estos números.

fasemultiplicado=angle(t)*180/pi;
B=[n t m];

moduloMatriz=abs(B);

%Si queremos ahora sacar la parte real e imaginaria de un número complejo
%debemos de usar los comandos:

ParteReal=real(t);
ParteImaginaria=imag(t);

