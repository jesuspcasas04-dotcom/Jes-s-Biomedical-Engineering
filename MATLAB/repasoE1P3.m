% Ejercicio 1
% Considera las siguientes secuencias discretas definidas en los intervalos indicados:
n_x=-3:3;  
x=[3,11,7,0,-1,4,2];

n_h= -1:4;
h=[2, 3, 0, -5, 2, 1];

y= conv(x,h);
n_y= (n_x(1) + n_h(1):n_x(end)+ n_h(end));

%Ahora representamos gráficamente n h e y.
figure(1);

subplot(3,1,1); stem(n_x, x,'filled'); title('Representación de x[n]'); xlabel('n'); ylabel('x[n]');
subplot(3,1,2); stem(n_h, h,'filled'); title('Representación de h[n]'); xlabel('n'); ylabel('h[n]');
subplot(3,1,3); stem(n_y, y,'filled'); title('Representación de y[n]'); xlabel('n'); ylabel('y[n]');


