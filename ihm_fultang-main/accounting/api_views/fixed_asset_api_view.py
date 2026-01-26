from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounting.models_financier import Asset
from accounting.serializers import AssetSerializer


class FixedAssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['is_active', 'category']
    search_fields = ['asset_number', 'name']
    ordering_fields = ['asset_number', 'created_at']

    @action(detail=True, methods=['get'])
    def depreciation(self, request, pk=None):
        asset = self.get_object()
        return Response({
            'asset_id': asset.id,
            'annual_depreciation': float(asset.calculate_annual_depreciation()),
            'accumulated_depreciation': float(asset.get_accumulated_depreciation()),
            'net_book_value': float(asset.get_net_book_value())
        })

    @action(detail=True, methods=['get'])
    def net_value(self, request, pk=None):
        asset = self.get_object()
        return Response({
            'net_book_value': float(asset.get_net_book_value()),
            'accumulated_depreciation': float(asset.get_accumulated_depreciation())
        })

    @action(detail=False, methods=['get'])
    def active_assets(self, request):
        assets = Asset.objects.filter(is_active=True)
        serializer = self.get_serializer(assets, many=True)
        return Response(serializer.data)