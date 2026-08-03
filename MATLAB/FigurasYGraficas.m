%Para crear figuras y gráficas de representaciones matemáticas debemos de
%realizar los siguiente:

a=[-3:0.5:3]; %Creamos un vector que va de -3 a 3 de 0,5 en 0,5.

figure(1); % Creamos una figura llamada figura 1.

plot(a); % La ploteamos o la representamos en una gráfica.

% Cuando solo metemos en el plot un parámetro MatLab rellena los valores x
% en función de los valores de a.
%También podemos poner de donde a donde queremo llegar en el eje x.
%Ejemplo:

n=0:10;
x=0.5.^n;
y=0.9.^n;

figure(2);

plot(n,x,'b'); hold on;
plot(n,y,'r'); hold off;

%También podemos plotear dos funciones en un comando de esta forma:
figure(3)
plot(n,x,'b',n,y,'r');

%Otro ejemplo:


x=[-pi:0.1:pi]; %x irá de -3.14 a 3.14 de 0.1 en 0.1.

f=sin(x); %Creamos la función senoidal.
figure(5);


plot(x,f,'b.'); 
xlabel('Radianes');
ylabel('Valores de sin(x)');
title('Representación de sin(x)');





