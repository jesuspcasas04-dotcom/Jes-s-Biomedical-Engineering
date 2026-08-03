%Ejercicio 1 práctica 1
%Genera las señales sinusoidales definidas como
% x1(t)=cos(2pi*5*t) ; x2(t)=0.4*cos(2pi*15*t)
% El intervalo de tiempo es 0:0.001:2.
%Lo crearemos en una misma figura y subplotearemos las tres funciones.

t=0:1/1000:2;
funcionA=cos(2*pi*5*t);
funcionB=0.4* cos(2*pi*15*t);
funcionC=funcionA+funcionB;

figure(1);
subplot(311); plot(t,funcionA,'b'); xlabel('Tiempo');ylabel("x1 (t)"); title('Representación de x1 (t) con respecto al tiempo');
subplot(312); plot(t,funcionB,'r'); xlabel('Tiempo');ylabel("x2 (t)"); title('Representación de x2 (t) con respecto al tiempo');
subplot(313); plot(t,funcionC,'m'); xlabel('Tiempo');ylabel("x1 (t) + x2 (t)"); title('Representación de x1 (t)+ x2 (t) con respecto al tiempo');
