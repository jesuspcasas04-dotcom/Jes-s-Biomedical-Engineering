
%w irá desde -4 pi hasta 4 pi, por tanto lo primero que haremos será
%delimitar ese espacio.
omega= linspace(-4*pi, 4*pi, 1000);

%Ahora creamos la función que nos han dado.
X= exp(-1*2*omega).*((sin(5*omega/2))./ (sin(omega/2)));

%Creamos la figura correspondiente en la que irá nuestra gráfica.
figure(2);

%Ahora tenemos que representar por una parte el módulo de la función, y por
%otro lado la fase en dos gráficos diferentes.

subplot(2,1,1); %Primero creamos el subgráfico 1 que contendrá el módulo de la función

plot(omega, abs(X), 'b'); %Ploteamos el primer subgráfico que contendrá el módulo, por eso el abs(x).

xlabel('\omega');
ylabel('|X(e^{j\omega})|');
title('Módulo de X(e^{j\omega})');
%Esto son títulos que le pondremos al gráfico.

hold on;

subplot(2,1,2); %Ahora creamos el subgráfico que representará la fase de nuestra función.
plot(omega, angle(X), 'r'); % Lo ploteamos con la función angle.
xlabel('\omega'); %Escribimos los correspondientes títulos en cada parte
ylabel('\angle X(e^{j\omega})');
title('Fase de X(e^{j\omega})');
hold on;