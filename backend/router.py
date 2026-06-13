def decide_route(condition_tier: str, confidence: int, suggested_resale_price: int) -> dict:
    TRANSPORT_COST = 150
    REFURBISHMENT_COST = 180
    LIQUIDATION_FLOOR = 400

    if confidence < 70:
        return {
            'routing_decision': 'Human Review Required',
            'routing_reason': 'AI confidence too low for automated routing. Manual inspection needed.',
        }

    net_resale = suggested_resale_price - TRANSPORT_COST

    if condition_tier in ['Like New', 'Good'] and net_resale > LIQUIDATION_FLOOR:
        return {
            'routing_decision': 'Resell on Amazon Rehome',
            'routing_reason': f'Net recovery ₹{net_resale} exceeds liquidation floor ₹{LIQUIDATION_FLOOR}. Listed regionally first.',
        }

    if condition_tier == 'Acceptable' and (net_resale - REFURBISHMENT_COST) > LIQUIDATION_FLOOR:
        return {
            'routing_decision': 'Refurbish Then Resell',
            'routing_reason': f'Post refurbishment net recovery ₹{net_resale - REFURBISHMENT_COST} exceeds liquidation floor. Refurbishment required before listing.',
        }

    if condition_tier == 'Liquidate' or net_resale <= LIQUIDATION_FLOOR:
        return {
            'routing_decision': 'Donate',
            'routing_reason': 'Recovery below liquidation floor. Item routed to donation partner.',
        }

    return {
        'routing_decision': 'Liquidate',
        'routing_reason': 'No viable recovery route found.',
    }
