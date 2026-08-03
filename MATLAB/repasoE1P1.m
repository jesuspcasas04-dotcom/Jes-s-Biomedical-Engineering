%Ejercicio 1 práctica 1
%Genera las señales sinusoidales definidas como
% x1(t)=cos(2pi*5*t) ; x2(t)=0.4*cos(2pi*15*t)
% El intervalo de tiempo es 0:0.001:2.
%Lo crearemos en una misma figura y subplotearemos las tres funciones.

t=0:0.001:2;
x1= cos(2*pi*5*t);
x2= 0.4* cos(2*pi*15*t);
x3= x1 + x2;

figure(1);

subplot(311); plot(t, x1, 'r'); xlabel('Tiempo'); ylabel('x1(t)=cos(2pi*5*t)'); title('Representación de x1 en función del tiempo');
subplot(312); plot(t, x2, 'b'); xlabel('Tiempo'); ylabel('x2(t)=0.4*cos(2pi*15*t)'); title('Representación de x2 en función del tiempo');
subplot(313); plot(t, x3, 'p'); xlabel('Tiempo'); ylabel('x1(t)+x2(t)'); title('Representación de x1+x2 en función del tiempo');


