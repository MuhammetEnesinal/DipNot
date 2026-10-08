FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY src/DipNot.Api/DipNot.Api.csproj src/DipNot.Api/
RUN dotnet restore src/DipNot.Api/DipNot.Api.csproj
COPY src/ src/
RUN dotnet publish src/DipNot.Api/DipNot.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
USER $APP_UID
ENTRYPOINT ["dotnet", "DipNot.Api.dll"]
