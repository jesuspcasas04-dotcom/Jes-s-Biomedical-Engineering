%Ejercicio 2 práctica 1 procesado de señales biomédicas
%
%En primer lugar hemos importado un conjunto de datos con 3 variables y a
%partir de ahí manipularemos los datos.
% En primer lugar debemos de representar gráficamente la variable hrv1.

figure(1);
plot(hrv1, 'b'); xlabel('Tiempo'); ylabel('Pulsaciones'); title('Representcación en pulsaciones/ min del corazón');

%Ahora la misión es calcular la media y la desviación estándar.
xtotal=0;
for i=1: length(hrv1)
 xtotal= hrv1(i)+ xtotal;
end

N= length(hrv1);

media= xtotal/N;

fprintf("La media de pulsaciones en los individuos registrados son: %.2f\n ", media);

desv_tip=sqrt((1/length(hrv1) * (sum((hrv1-media).^2))));
fprintf("La desviación estándar de pulsaciones en los individuos registrados son: %.2f\n ", desv_tip);

