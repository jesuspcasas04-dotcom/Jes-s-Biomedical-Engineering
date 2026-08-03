A=2.3+2j; 
B=2.3+j*2; %A y B son iguales, pero se escriben de manera distinta.

a= abs(1+1j); % módulo del número imaginario. sqtr(1^^2 + 1^^2).

b = angle(1+1j); % Argumento del número imaginario. arctan (1/1).

c=angle(1+1j)*180/pi; % Hemos multiplicado por 180/pi a la artg(1/1), es decir, que hemos pasado de radianes a grados.

d = [1+0.5j -3-1.2j 0.6-2j]; % Vector de números complejos. el abs y angle nos genera un vector con respuestas en cada posición del número.

e=real(d); % Parte real de cada número del vector.
f=imag(d); % Parte imaginaria de cada número del vector.

A= [-3:0.5:3]; %Creamos un vector de -3 a 3 de 0,5 en 0,5 --> [-3,-2.5,-2,-1.5,-1...3]
figure(1);
plot(A);

% Ahora representamos dos funciones x e y.
% Ya tenemos las funciones, pero... en que intervalo de n las
% representamos?
n=0:10;
x= 0.5.^n;
y= 0.9.^n;
%Ahora ploteamos.
figure(1);
plot(n,x,'ro-',n,y,'b');

%CON SUBPLOT MOSTRAMOS LAS DEFERENTES SEÑALES EN DISTINTAS GRÁFICAS DENTRO
%DE LA MISMA FIGURA
x=-pi:0.1:pi;
figure(1);
subplot(211); plot(x,sin(x),'b.');
subplot(212); plot(x,cos(x),'gd-');xlabel('x (radianes)');ylabel('cos(x)');title('Título')


x=-pi:0.5:pi;
figure(1);
stem(x,sin(x));


